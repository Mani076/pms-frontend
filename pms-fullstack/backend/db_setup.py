from sqlmodel import SQLModel, Session, select
from database import engine
from models import Faculty, Project, Student, Skill, StudentSkill, ProjectAllocation, Department, User
from datetime import date

def init_db():
    SQLModel.metadata.drop_all(engine) # Optional: Reset DB for clean state
    SQLModel.metadata.create_all(engine)
    print("Tables created successfully.")

    with Session(engine) as session:
        if session.exec(select(Department)).first():
            print("Data exists.")
            return

        # 1. Add Departments
        d1 = Department(department_name="Computer Science")
        d2 = Department(department_name="Information Technology")
        session.add(d1)
        session.add(d2)
        session.commit()

        # 2. Add Faculty (Guides)
        f1 = Faculty(first_name="Alice", last_name="Wong", email="alice@uni.edu", designation="Professor", department=d1)
        f2 = Faculty(first_name="Bob", last_name="Green", email="bob@uni.edu", designation="Asst. Professor", department=d2)
        session.add(f1)
        session.add(f2)
        session.commit()

        # 3. Add Projects
        p1 = Project(project_name="ML Data Analysis", description="COVID Trends", status="In Progress", start_date=date(2023, 1, 15), guide=f1)
        p2 = Project(project_name="Library System", description="Book tracking", status="Planned", guide=f2)
        session.add(p1)
        session.add(p2)

        # 4. Add Students
        s1 = Student(first_name="John", last_name="Doe", email="john@uni.edu", phone_number="1234567890", department=d1)
        s2 = Student(first_name="Jane", last_name="Smith", email="jane@uni.edu", phone_number="0987654321", department=d2)
        s3 = Student(first_name="Mike", last_name="Ross", email="mike@uni.edu", department=d1)
        session.add(s1)
        session.add(s2)
        session.add(s3)
        
        # 5. Add Skills
        sk1 = Skill(skill_name="Python")
        sk2 = Skill(skill_name="SQL")
        session.add(sk1)
        session.add(sk2)
        
        session.commit()

        # 6. Assign Skills & Projects
        session.add(StudentSkill(student_id=s1.student_id, skill_id=sk1.skill_id, proficiency_level="Expert"))
        session.add(ProjectAllocation(project_id=p1.project_id, student_id=s1.student_id))

        session.commit()
        print("Sample data inserted.")

        # Admin
        session.add(User(email="admin@uni.edu", password="admin", role="admin"))

        # Faculty Users (Alice as Head, Bob as Guide)
        session.add(User(email="alice@uni.edu", password="1234", role="head"))
        session.add(User(email="bob@uni.edu", password="1234", role="guide"))

        # Student Users
        session.add(User(email="john@uni.edu", password="1234", role="student"))
        session.add(User(email="jane@uni.edu", password="1234", role="student"))
        session.add(User(email="mike@uni.edu", password="1234", role="student"))

        session.commit()
        print("Data initialized.")

if __name__ == "__main__":
    init_db()