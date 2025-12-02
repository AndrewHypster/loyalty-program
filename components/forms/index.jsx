"use client";

import { useState } from "react";
import "./style.css";

const AddClientForm = () => {
  const handleSubmit = async (e) => {
    e.preventDefault();
    const phone = e.target.phone.value;
    const bonus = e.target.bonus.value;

    const resp = await fetch("/api/google-sheets", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        action: "ADD_CLIENT",
        phone,
        bonus,
      }),
    });

    const data = await resp.json();

    alert(
      data.success
        ? `Клієнта створено!\nТелефон: ${phone}\nБонуси: ${bonus}`
        : `Клієнт з номером ${phone} вже є`
    );
  };

  return (
    <form className="main-form" onSubmit={handleSubmit}>
      <h2>Додати клієнта</h2>
      <input type="number" name="phone" placeholder="Телефон 068..." required />
      <input type="number" name="bonus" placeholder="Бонуси" required />
      <button className="btn">Додати клієнта</button>
    </form>
  );
};

const FindClientForm = () => {
  const [client, setClient] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const phone = e.target.phone.value;

    const resp = await fetch("/api/google-sheets", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        action: "FIND_CLIENT",
        phone,
      }),
    });

    const data = await resp.json();
    console.log(data);
    if (data.success) {
      setClient(data.client);
    } else alert("Клієнта незнайдено");
  };

  return (
    <>
      <form className="main-form" onSubmit={handleSubmit}>
        <h2>Знайти клієнта</h2>
        <input type="number" name="phone" placeholder="Телефон" required />
        <button className="btn">Знайти</button>
      </form>

      {client && (
        <form className="main-form">
          <p>Телефон: {client.phone}</p>
          <p>Бонуси: {client.bonus}</p>
        </form>
      )}
    </>
  );
};

const UpdateBonusForm = () => {
  const [found, setFound] = useState(null);
  const [value, setValue] = useState(0);

  const lookup = async (e) => {
    e.preventDefault();
    const phone = e.target.phone.value;

    const res = await fetch("/api/google-sheets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "FIND_CLIENT",
        phone,
      }),
    });

    const data = await res.json();
    setFound(data);
    setValue(data.client.bonus);
  };

  const update = async (e) => {
    e.preventDefault();

    const resp = await fetch("/api/google-sheets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "CHANGE_CLIENT",
        phone: found.client.phone,
        bonus: value,
      }),
    });
    const data = await resp.json()
    

    if (data.success) {
      alert("Бонуси змінено!");
    }
  };

  const handleInput = (e) => {
    const value = +e.target.value;
    setValue(+found.client.bonus + value);
  };

  return (
    <div>
      {/* Спершу шукаємо клієнта */}
      {!found && (
        <form className="main-form" onSubmit={lookup}>
          <h1>Знайди і зміни</h1>
          <input name="phone" placeholder="Телефон" required />
          <button className="btn">Знайти</button>
        </form>
      )}

      {/* Якщо клієнта знайдено — форма зміни бонусів */}
      {found && (
        <form className="main-form" onSubmit={update}>
          <h1>Зміни бонуси</h1>
          <p>
            Поточні бонуси: <b>{found.client.bonus}</b> <br/>
            Змінені: {value}
          </p>
          <input
            type="number"
            name="bonus"
            onChange={handleInput}
            placeholder="Відняти -1 Додати 1"
            required
          />
          <button
            className="btn"
            style={value >=0 ? {} : { opacity: 0, pointerEvents: "none" }}
          >
            Зберегти
          </button>
        </form>
      )}
    </div>
  );
};

export { AddClientForm, FindClientForm, UpdateBonusForm };
