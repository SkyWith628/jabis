import json
from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session
from database.db import get_db, StudyPlan
from services import openai_service

router = APIRouter(prefix="/plan", tags=["plan"])


class PlanRequest(BaseModel):
    goal: str
    duration_weeks: int
    level: str = "beginner"  # beginner / intermediate / advanced


class PlanResponse(BaseModel):
    id: int
    title: str
    content: dict


@router.post("", response_model=PlanResponse)
async def create_plan(req: PlanRequest, db: Session = Depends(get_db)):
    raw = await openai_service.generate_plan(req.goal, req.duration_weeks, req.level)
    content = json.loads(raw)

    plan = StudyPlan(
        title=content.get("title", req.goal),
        goal=req.goal,
        duration_weeks=req.duration_weeks,
        content=raw,
    )
    db.add(plan)
    db.commit()
    db.refresh(plan)

    return PlanResponse(id=plan.id, title=plan.title, content=content)


@router.get("")
async def list_plans(db: Session = Depends(get_db)):
    plans = db.query(StudyPlan).order_by(StudyPlan.created_at.desc()).all()
    return [
        {
            "id": p.id,
            "title": p.title,
            "goal": p.goal,
            "duration_weeks": p.duration_weeks,
            "created_at": p.created_at,
        }
        for p in plans
    ]


@router.get("/{plan_id}")
async def get_plan(plan_id: int, db: Session = Depends(get_db)):
    plan = db.query(StudyPlan).filter(StudyPlan.id == plan_id).first()
    if not plan:
        return {"error": "플랜을 찾을 수 없습니다."}
    return {"id": plan.id, "title": plan.title, "content": json.loads(plan.content)}


@router.delete("/{plan_id}")
async def delete_plan(plan_id: int, db: Session = Depends(get_db)):
    plan = db.query(StudyPlan).filter(StudyPlan.id == plan_id).first()
    if plan:
        db.delete(plan)
        db.commit()
    return {"message": "플랜이 삭제되었습니다."}
