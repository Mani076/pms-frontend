from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import Session, select
from sqlalchemy.orm import selectinload
from typing import List

from database import get_session
from models import (
    Project, Student, ProjectCreate, StudentCreate, 
    Faculty, Skill, StudentSkill, ProjectAllocation, Department
)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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

@app.post("/api/students")
def add_student(student_data: StudentCreate, session: Session = Depends(get_session)):
    new_student = Student(
        first_name=student_data.firstName,
        last_name=student_data.lastName,
        email=student_data.email,
        phone_number=student_data.phoneNumber,
        department_id=student_data.deptId
    )
    session.add(new_student)
    session.commit()
    session.refresh(new_student)
    return {"id": new_student.student_id}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=3002)