from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import Session, select
from sqlalchemy.orm import selectinload
from typing import List

from database import get_session
from models import (
    Project, Student, ProjectCreate, StudentCreate, User,
    Faculty, Skill, StudentSkill, ProjectAllocation, Department, LoginRequest, UserCreateRequest, AllocationCreate,
    DepartmentCreate, ChangePasswordRequest, SkillAddRequest
)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/api/users")
def create_user_profile(user_data: UserCreateRequest, session: Session = Depends(get_session)):
    # 1. Check if email already exists
    if session.exec(select(User).where(User.email == user_data.email)).first():
        raise HTTPException(status_code=400, detail="Email already registered")

    # 2. Create User Login Credential (Default password '1234')
    new_user = User(
        email=user_data.email, 
        password="1234", 
        role=user_data.role
    )
    session.add(new_user)

    # 3. Create Specific Profile based on Role
    if user_data.role == "student":
        new_student = Student(
            first_name=user_data.firstName,
            last_name=user_data.lastName,
            email=user_data.email,
            department_id=user_data.deptId
        )
        session.add(new_student)
    
    elif user_data.role in ["guide", "head"]:
        new_faculty = Faculty(
            first_name=user_data.firstName,
            last_name=user_data.lastName,
            email=user_data.email,
            designation="Faculty" if user_data.role == "guide" else "HOD",
            department_id=user_data.deptId
        )
        session.add(new_faculty)

    session.commit()
    return {"message": f"User {user_data.email} created as {user_data.role}"}

@app.post("/api/login")
def login(login_data: LoginRequest, session: Session = Depends(get_session)):
    statement = select(User).where(User.email == login_data.email)
    user = session.exec(statement).first()

    if not user or user.password != login_data.password:
        raise HTTPException(status_code=401, detail="Invalid email or password")

    # Determine Profile ID (Student/Faculty ID)
    related_id = None
    if user.role == "student":
        stu = session.exec(select(Student).where(Student.email == user.email)).first()
        if stu: related_id = stu.student_id
    elif user.role in ["guide", "head"]:
        fac = session.exec(select(Faculty).where(Faculty.email == user.email)).first()
        if fac: related_id = fac.faculty_id
    
    return {
        "message": "Login successful",
        "role": user.role,
        "user_id": related_id,   # Profile ID (for dashboards)
        "auth_id": user.user_id, # User Account ID (for password change) [NEW]
        "email": user.email
    }

@app.post("/api/change-password")
def change_password(data: ChangePasswordRequest, session: Session = Depends(get_session)):
    user = session.get(User, data.auth_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if user.password != data.old_password:
        raise HTTPException(status_code=400, detail="Incorrect current password")
    
    user.password = data.new_password
    session.add(user)
    session.commit()
    return {"message": "Password updated successfully"}

# 1. [ADMIN] Allocations with Guide & Department info
@app.get("/api/allocations")
def get_allocations(session: Session = Depends(get_session)):
    statement = select(Project).options(
        selectinload(Project.guide),
        selectinload(Project.allocations).selectinload(ProjectAllocation.student)
    )
    results = session.exec(statement).all()

    response_data = []
    for p in results:
        team_members = []
        for alloc in p.allocations:
            if alloc.student:
                team_members.append({
                    "id": alloc.student.student_id,
                    "name": f"{alloc.student.first_name} {alloc.student.last_name}",
                    "email": alloc.student.email,
                    "phone": alloc.student.phone_number
                })
        
        response_data.append({
            "project_id": p.project_id,
            "projectName": p.project_name,
            "status": p.status,
            "startDate": p.start_date,
            "guideName": f"{p.guide.first_name} {p.guide.last_name}" if p.guide else "Unassigned",
            "teamMembers": team_members
        })
    return response_data

# 2. [STUDENT] Profile + Skills + Department
@app.get("/api/student/{student_id}")
def get_student_profile(student_id: int, session: Session = Depends(get_session)):
    statement = select(Student).where(Student.student_id == student_id).options(
        selectinload(Student.department),
        selectinload(Student.allocation).selectinload(ProjectAllocation.project).selectinload(Project.guide)
    )
    student = session.exec(statement).first()

    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    skills_stmt = select(Skill.skill_name, StudentSkill.proficiency_level).join(StudentSkill).where(StudentSkill.student_id == student_id)
    skills_results = session.exec(skills_stmt).all()
    skills_formatted = [{"skill_name": s[0], "proficiency_level": s[1]} for s in skills_results]

    profile_data = {
        "first_name": student.first_name,
        "last_name": student.last_name,
        "email": student.email,
        "phone": student.phone_number,
        "department": student.department.department_name if student.department else "N/A",
        "project_name": None,
        "status": None,
        "guide_fn": None,
        "guide_ln": None
    }

    if student.allocation and student.allocation.project:
        proj = student.allocation.project
        profile_data["project_name"] = proj.project_name
        profile_data["status"] = proj.status
        if proj.guide:
            profile_data["guide_fn"] = proj.guide.first_name
            profile_data["guide_ln"] = proj.guide.last_name

    return {"profile": profile_data, "skills": skills_formatted}

# 3. [HOD] Create Project
@app.post("/api/projects")
def create_project(project_data: ProjectCreate, session: Session = Depends(get_session)):
    new_project = Project(
        project_name=project_data.name,
        description=project_data.description,
        guide_id=project_data.guideId,
        start_date=project_data.startDate,
        status="Planned"
    )
    session.add(new_project)
    session.commit()
    session.refresh(new_project)
    return {"message": "Project created", "id": new_project.project_id}

# 4. [ADMIN] Get/Add Students
@app.get("/api/students")
def get_students(session: Session = Depends(get_session)):
    return session.exec(select(Student)).all()

@app.get("/api/students")
def get_students(session: Session = Depends(get_session)):
    # 1. Fetch students with their allocation info loaded
    students = session.exec(select(Student).options(selectinload(Student.allocation))).all()
    
    # 2. Fetch all skills for all students in one query
    stmt = select(StudentSkill.student_id, Skill.skill_name, StudentSkill.proficiency_level).join(Skill)
    skill_links = session.exec(stmt).all()
    
    # 3. Create a map of StudentID -> "Skill (Level)" strings
    skills_map = {}
    for sid, sname, level in skill_links:
        if sid not in skills_map:
            skills_map[sid] = []
        skills_map[sid].append(f"{sname} ({level})")
    
    # 4. Build the final response list
    result = []
    for s in students:
        s_dict = {
            "student_id": s.student_id,
            "first_name": s.first_name,
            "last_name": s.last_name,
            "email": s.email,
            # Helper boolean to disable already-allocated students
            "is_allocated": (s.allocation is not None),
            # The formatted skills string
            "skills_str": ", ".join(skills_map.get(s.student_id, []))
        }
        result.append(s_dict)
    return result

@app.get("/api/allocations")
def get_allocations(session: Session = Depends(get_session)):
    statement = select(Project).options(
        selectinload(Project.guide),
        selectinload(Project.allocations).selectinload(ProjectAllocation.student)
    )
    results = session.exec(statement).all()

    response_data = []
    for p in results:
        team_members = []
        for alloc in p.allocations:
            if alloc.student:
                team_members.append({
                    "id": alloc.student.student_id,
                    "name": f"{alloc.student.first_name} {alloc.student.last_name}",
                    "email": alloc.student.email,
                    "phone": alloc.student.phone_number
                })
        
        response_data.append({
            "project_id": p.project_id,
            "projectName": p.project_name,
            "status": p.status,
            "startDate": p.start_date,
            "guide_id": p.guide_id, # <--- ADDED THIS FIELD
            "guideName": f"{p.guide.first_name} {p.guide.last_name}" if p.guide else "Unassigned",
            "teamMembers": team_members
        })
    return response_data

# 2. [STUDENT] Profile
@app.get("/api/student/{student_id}")
def get_student_profile(student_id: int, session: Session = Depends(get_session)):
    statement = select(Student).where(Student.student_id == student_id).options(
        selectinload(Student.department),
        selectinload(Student.allocation).selectinload(ProjectAllocation.project).selectinload(Project.guide)
    )
    student = session.exec(statement).first()

    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    profile_data = {
        "first_name": student.first_name,
        "last_name": student.last_name,
        "email": student.email,
        "department": student.department.department_name if student.department else "N/A",
        # Project Details
        "project_name": None,
        "status": None,
        "guide_name": None
    }

    if student.allocation and student.allocation.project:
        proj = student.allocation.project
        profile_data["project_name"] = proj.project_name
        profile_data["status"] = proj.status
        if proj.guide:
            profile_data["guide_name"] = f"{proj.guide.first_name} {proj.guide.last_name}"

    return {"profile": profile_data}


@app.get("/api/faculty")
def get_faculty(session: Session = Depends(get_session)):
    # Fetch all faculty and include their department info
    statement = select(Faculty).options(selectinload(Faculty.department))
    results = session.exec(statement).all()
    return results

@app.get("/api/departments")
def get_departments(session: Session = Depends(get_session)):
    # Load departments with their faculty list
    statement = select(Department).options(selectinload(Department.faculty))
    results = session.exec(statement).all()
    
    dept_data = []
    for d in results:
        head_name = "No Head Assigned"
        # Find the HOD in this department
        if d.faculty:
            for f in d.faculty:
                # We identify the head by the designation set during creation
                if f.designation in ["HOD", "Head", "Department Head"]:
                    head_name = f"{f.first_name} {f.last_name}"
                    break
        
        dept_data.append({
            "id": d.department_id,
            "name": d.department_name,
            "head_name": head_name
        })
    return dept_data

@app.post("/api/allocations")
def allocate_student(data: AllocationCreate, session: Session = Depends(get_session)):
    # Check if student is already allocated
    existing = session.exec(select(ProjectAllocation).where(ProjectAllocation.student_id == data.student_id)).first()
    if existing:
        raise HTTPException(status_code=400, detail="Student is already allocated to a project.")
    
    # Create new allocation
    new_alloc = ProjectAllocation(project_id=data.project_id, student_id=data.student_id)
    session.add(new_alloc)
    session.commit()
    return {"message": "Student allocated successfully"}

@app.post("/api/departments")
def create_department(dept_data: DepartmentCreate, session: Session = Depends(get_session)):
    # Check if exists
    existing = session.exec(select(Department).where(Department.department_name == dept_data.name)).first()
    if existing:
        raise HTTPException(status_code=400, detail="Department already exists")
    
    new_dept = Department(department_name=dept_data.name)
    session.add(new_dept)
    session.commit()
    session.refresh(new_dept)
    return {"message": "Department created", "id": new_dept.department_id}

@app.post("/api/student/skills")
def add_student_skill(data: SkillAddRequest, session: Session = Depends(get_session)):
    # 1. Find or Create the Skill globally
    # We use lowercase to prevent "Python" vs "python" duplicates
    statement = select(Skill).where(Skill.skill_name == data.skill_name)
    skill = session.exec(statement).first()

    if not skill:
        skill = Skill(skill_name=data.skill_name)
        session.add(skill)
        session.commit()
        session.refresh(skill)
    
    # 2. Link Skill to Student (Update level if already exists)
    link_stmt = select(StudentSkill).where(
        StudentSkill.student_id == data.student_id, 
        StudentSkill.skill_id == skill.skill_id
    )
    link = session.exec(link_stmt).first()

    if link:
        link.proficiency_level = data.level # Update existing
    else:
        link = StudentSkill(
            student_id=data.student_id, 
            skill_id=skill.skill_id, 
            proficiency_level=data.level
        )
        session.add(link)
    
    session.commit()
    return {"message": "Skill added successfully"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=3002)