from typing import Optional, List
from sqlmodel import SQLModel, Field, Relationship
from sqlalchemy import Identity  # <--- CRITICAL IMPORT
from datetime import date

# --- JOIN TABLES ---

class StudentSkill(SQLModel, table=True):
    __tablename__ = "student_skills"
    # These are foreign keys, so no Identity needed here
    student_id: Optional[int] = Field(default=None, foreign_key="students.student_id", primary_key=True)
    skill_id: Optional[int] = Field(default=None, foreign_key="skills.skill_id", primary_key=True)
    proficiency_level: str = Field(max_length=50)

class ProjectAllocation(SQLModel, table=True):
    __tablename__ = "project_allocation"
    # Identity needed for the PK
    proj_allocation_id: Optional[int] = Field(default=None, primary_key=True, sa_column_args=[Identity()])
    project_id: Optional[int] = Field(default=None, foreign_key="projects.project_id")
    student_id: int = Field(unique=True, foreign_key="students.student_id")

    # Relationships
    project: "Project" = Relationship(back_populates="allocations")
    student: "Student" = Relationship(back_populates="allocation")

# --- MAIN TABLES ---

class Department(SQLModel, table=True):
    __tablename__ = "departments"
    # Identity needed
    department_id: Optional[int] = Field(default=None, primary_key=True, sa_column_args=[Identity()])
    department_name: str = Field(max_length=100)

    # Relationships
    students: List["Student"] = Relationship(back_populates="department")
    faculty: List["Faculty"] = Relationship(back_populates="department")

class Faculty(SQLModel, table=True):
    __tablename__ = "faculty"
    # Identity needed
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
    # Identity needed
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

class Student(SQLModel, table=True):
    __tablename__ = "students"
    # Identity needed
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
    # Identity needed
    skill_id: Optional[int] = Field(default=None, primary_key=True, sa_column_args=[Identity()])
    skill_name: str = Field(unique=True, max_length=100)

    # Relationship
    students: List[Student] = Relationship(back_populates="skills", link_model=StudentSkill)

# --- Pydantic Schemas for API Requests ---
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