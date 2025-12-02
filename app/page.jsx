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
    async function w() {
      const resp = await fetch("/api/google-sheets", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "FIND_CLIENT",
          phone: "0685325881",
          bonus: "1",
        }),
      });

      const data = await resp.json();
      console.log(data);
    }
    // w()
  }, []);

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
