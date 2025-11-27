from typing import Optional, List
from sqlmodel import SQLModel, Field, Relationship
from datetime import date
from typing import Optional, List
from sqlmodel import SQLModel, Field, Relationship
from sqlalchemy import Identity
from datetime import date

class StudentSkill(SQLModel, table=True):
    __tablename__ = "student_skills"
    student_id: Optional[int] = Field(default=None, foreign_key="students.student_id", primary_key=True)
    skill_id: Optional[int] = Field(default=None, foreign_key="skills.skill_id", primary_key=True)
    proficiency_level: str = Field(max_length=50)

class ProjectAllocation(SQLModel, table=True):
    __tablename__ = "project_allocation"
    proj_allocation_id: Optional[int] = Field(default=None, primary_key=True, sa_column_args=[Identity()])
    project_id: Optional[int] = Field(default=None, foreign_key="projects.project_id")
    student_id: int = Field(unique=True, foreign_key="students.student_id")

    # Relationships
    project: "Project" = Relationship(back_populates="allocations")
    student: "Student" = Relationship(back_populates="allocation")


class Department(SQLModel, table=True):
    __tablename__ = "departments"
    department_id: Optional[int] = Field(default=None, primary_key=True, sa_column_args=[Identity()])
    department_name: str = Field(max_length=100)

    # Relationships
    students: List["Student"] = Relationship(back_populates="department")
    faculty: List["Faculty"] = Relationship(back_populates="department")

class Faculty(SQLModel, table=True):
    __tablename__ = "faculty"
    faculty_id: Optional[int] = Field(default=None, primary_key=True, sa_column_args=[Identity()])
    first_name: str = Field(max_length=100)
    last_name: str = Field(max_length=100)
    email: str = Field(unique=True, max_length=100)
    designation: Optional[str] = Field(default=None, max_length=100)
    department_id: Optional[int] = Field(default=None, foreign_key="departments.department_id")

    # Relationships
    department: Optional[Department] = Relationship(back_populates="faculty")
    projects: List["Project"] = Relationship(back_populates="guide")

class Project(SQLModel, table=True):
    __tablename__ = "projects"
    project_id: Optional[int] = Field(default=None, primary_key=True, sa_column_args=[Identity()])
    project_name: str = Field(max_length=200)
    description: Optional[str] = Field(default=None, max_length=1000)
    status: str = Field(default="Planned", max_length=50)
    start_date: Optional[date] = Field(default=None)
    end_date: Optional[date] = Field(default=None)
    guide_id: Optional[int] = Field(default=None, foreign_key="faculty.faculty_id")

    # Relationships
    guide: Optional[Faculty] = Relationship(back_populates="projects")
    allocations: List[ProjectAllocation] = Relationship(back_populates="project")

class User(SQLModel, table=True):
    __tablename__ = "users"
    user_id: Optional[int] = Field(default=None, primary_key=True, sa_column_args=[Identity()])
    email: str = Field(unique=True, max_length=100)
    password: str = Field(max_length=100) 
    role: str = Field(max_length=20)

class Student(SQLModel, table=True):
    __tablename__ = "students"
    student_id: Optional[int] = Field(default=None, primary_key=True, sa_column_args=[Identity()])
    first_name: str = Field(max_length=100)
    last_name: str = Field(max_length=100)
    email: str = Field(unique=True, max_length=100)
    phone_number: Optional[str] = Field(default=None, max_length=20)
    department_id: Optional[int] = Field(default=None, foreign_key="departments.department_id")

    # Relationships
    department: Optional[Department] = Relationship(back_populates="students")
    allocation: Optional[ProjectAllocation] = Relationship(back_populates="student")
    skills: List["Skill"] = Relationship(back_populates="students", link_model=StudentSkill)

class Skill(SQLModel, table=True):
    __tablename__ = "skills"
    skill_id: Optional[int] = Field(default=None, primary_key=True, sa_column_args=[Identity()])
    skill_name: str = Field(unique=True, max_length=100)

    # Relationship
    students: List[Student] = Relationship(back_populates="skills", link_model=StudentSkill)

class ProjectCreate(SQLModel):
    name: str
    description: str
    guideId: int
    startDate: Optional[date] = None

class StudentCreate(SQLModel):
    firstName: str
    lastName: str
    email: str
    phoneNumber: Optional[str] = None
    deptId: int

class LoginRequest(SQLModel):
    email: str
    password: str

class UserCreateRequest(SQLModel):
    firstName: str
    lastName: str
    email: str
    role: str
    deptId: int

class AllocationCreate(SQLModel):
    project_id: int
    student_id: int

class DepartmentCreate(SQLModel):
    name: str

class ChangePasswordRequest(SQLModel):
    auth_id: int
    old_password: str
    new_password: str    

class SkillAddRequest(SQLModel):
    student_id: int
    skill_name: str
    level: str