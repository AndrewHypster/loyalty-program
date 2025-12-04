"use client";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import {
  AddClientForm,
  FindClientForm,
  UpdateBonusForm,
} from "@/components/forms";
import "./style.css";

export default function Home() {
  const session = useSession();
  const [form, setForm] = useState(null);
  console.log(session);

  useEffect(() => {
    
    
  }, [session]);

  return (
    <main className="main-page">
      <h1 className="main-title">
        Система бонусів<small>{session.data?.user.email}</small>
      </h1>
      <section className="main-content">
        {/* Форми */}
        {form === "add" && <AddClientForm />}
        {form === "find" && <FindClientForm />}
        {form === "update" && <UpdateBonusForm />}
        <div className="main-btns">
          <button className="main-btn" onClick={() => setForm("add")}>
            Додати клієнта
          </button>
          <button className="main-btn" onClick={() => setForm("update")}>
            Змінити бонуси
          </button>
          <button className="main-btn" onClick={() => setForm("find")}>
            Знайти клієнта
          </button>
        </div>
      </section>
    </main>
  );
}
