from datetime import datetime, timedelta, time
from sqlmodel import Session, select
from models import RendezVous

def get_next_available(medecin_id: int, session: Session):

    now = datetime.utcnow()

    # 🔹 horaires de travail (modifiable)
    start_hour = 9
    end_hour = 17

    for day_offset in range(0, 7):  # 🔥 check 7 jours
        day = now.date() + timedelta(days=day_offset)

        for hour in range(start_hour, end_hour):
            slot_time = time(hour, 0)
            
            # 🔹 Si c'est aujourd'hui, ignorer les créneaux passés
            if day == now.date() and slot_time <= now.time():
                continue

            # 🔹 vérifier si ce créneau est déjà pris (et non annulé)
            rdv = session.exec(
                select(RendezVous).where(
                    (RendezVous.medecin_id == medecin_id) &
                    (RendezVous.date == day) &
                    (RendezVous.heure == slot_time) &
                    (RendezVous.statut != "ANNULE") &
                    (RendezVous.statut != "REFUSE")
                )
            ).first()

            if not rdv:
                return {
                    "date": str(day),
                    "heure": slot_time.strftime("%H:%M")
                }

    return None