"use client";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import './style.css'

const Profile = () => {
  const params = useParams();
  const phone = params.phone;
  const [data, setData] = useState(null);

  useEffect(() => {
    const loadCLient = async () => {
      if (phone) {
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
        setData(data);
      }
    };
    loadCLient();
  }, [phone]);

  return (
    <main className="profile-page">
      {data ? (
        data.success ? (
          <div className="profile-card">
            <p>Телефон: {data.client.phone}</p>
            <p>Доступні бонуси: {data.client.bonus}</p>
          </div>
        ) : (
          <div className="profile-err">Клієнта не знайдено</div>
        )
      ) : (
        <div className="profile-loading">Зачекайте</div>
      )}
      {/* <div className="profile-err">Клієнта незнайдено</div> */}
    </main>
  );
};

export default Profile;
