import React, { useState, useContext } from "react";
import { UserContext } from "./UserContext";

export default function SettingsPage() {
  const { user, setUser } = useContext(UserContext);

  const [nickname, setNickname] = useState(user?.nickname || "");
  const [email, setEmail] = useState(user?.email || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [edit, setEdit] = useState(false);
  const [msg, setMsg] = useState("");

  const handleSave = async () => {
    setMsg("");
    if (!nickname || !email) {
      setMsg("Никнейм и Email обязательны");
      return;
    }
    if (password && password !== repeatPassword) {
      setMsg("Пароли не совпадают");
      return;
    }

    try {
      const res = await fetch(`http://localhost:3001/api/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nickname,
          email,
          phone,
          password: password || undefined,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setUser(data.user); // Обновить контекст
        setMsg("Изменения сохранены");
        setEdit(false);
        setPassword("");
        setRepeatPassword("");
      } else {
        setMsg(data.error || "Ошибка сохранения");
      }
    } catch {
      setMsg("Ошибка соединения с сервером");
    }
  };

  return (
    <div className="flex flex-col items-center min-h-[80vh] py-12">
      <div className="w-full max-w-[430px] rounded-2xl bg-white shadow-xl px-8 py-10 relative">
        <div className="flex items-center mb-8">
          <div className="bg-yellow-400 rounded-full w-12 h-12 flex items-center justify-center text-black font-bold text-2xl mr-4">
            {user?.nickname ? user.nickname[0].toUpperCase() : "U"}
          </div>
          <div>
            <div className="font-bold text-lg text-black">{user?.nickname}</div>
            <div className="text-sm text-gray-400">{user?.email || user?.phone}</div>
          </div>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-500 mb-1">Никнейм</label>
            <input
              type="text"
              disabled={!edit}
              className={`w-full px-3 py-2 rounded-md border focus:ring-2 ring-yellow-400 bg-gray-50 text-black ${edit ? "border-yellow-400" : "border-gray-200"}`}
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm text-gray-500 mb-1">Email</label>
            <input
              type="email"
              disabled={!edit}
              className={`w-full px-3 py-2 rounded-md border focus:ring-2 ring-yellow-400 bg-gray-50 text-black ${edit ? "border-yellow-400" : "border-gray-200"}`}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm text-gray-500 mb-1">Телефон</label>
            <input
              type="text"
              disabled={!edit}
              className={`w-full px-3 py-2 rounded-md border focus:ring-2 ring-yellow-400 bg-gray-50 text-black ${edit ? "border-yellow-400" : "border-gray-200"}`}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
          {edit && (
            <>
              <div>
                <label className="block text-sm text-gray-500 mb-1">Новый пароль</label>
                <input
                  type="password"
                  className="w-full px-3 py-2 rounded-md border focus:ring-2 ring-yellow-400 bg-gray-50 text-black border-yellow-400"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Оставьте пустым, если не меняете"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-500 mb-1">Повторите пароль</label>
                <input
                  type="password"
                  className="w-full px-3 py-2 rounded-md border focus:ring-2 ring-yellow-400 bg-gray-50 text-black border-yellow-400"
                  value={repeatPassword}
                  onChange={(e) => setRepeatPassword(e.target.value)}
                  placeholder="Оставьте пустым, если не меняете"
                />
              </div>
            </>
          )}
        </div>
        <div className="flex justify-between mt-8">
          {!edit ? (
            <button
              onClick={() => setEdit(true)}
              className="px-5 py-2 rounded-lg bg-yellow-400 hover:bg-yellow-300 text-black font-bold shadow transition"
            >
              Редактировать
            </button>
          ) : (
            <>
              <button
                onClick={handleSave}
                className="px-5 py-2 rounded-lg bg-yellow-400 hover:bg-yellow-300 text-black font-bold shadow transition"
              >
                Сохранить
              </button>
              <button
                onClick={() => setEdit(false)}
                className="px-5 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-600 font-bold shadow transition"
              >
                Отмена
              </button>
            </>
          )}
        </div>
        {msg && <div className="mt-4 text-center text-yellow-600">{msg}</div>}
      </div>
    </div>
  );
}
