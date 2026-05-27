import { readNotifications } from "@/lib/notifications";

export const dynamic = "force-dynamic";

export default async function Home() {
  const notifications = await readNotifications();

  return (
    <main className="shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">JSON persistente na Vercel</p>
          <h1>Notificacoes recebidas</h1>
        </div>
        <a href="/api/notifications" className="jsonLink">
          Abrir JSON
        </a>
      </header>

      <section className="summary">
        <div>
          <span>Total</span>
          <strong>{notifications.length}</strong>
        </div>
        <div>
          <span>Ultima</span>
          <strong>{notifications[0] ? formatDate(notifications[0].receivedAt) : "Sem dados"}</strong>
        </div>
      </section>

      <section className="tableWrap">
        <table>
          <thead>
            <tr>
              <th>Recebida</th>
              <th>App</th>
              <th>Titulo</th>
              <th>Texto</th>
              <th>Pacote</th>
            </tr>
          </thead>
          <tbody>
            {notifications.length === 0 ? (
              <tr>
                <td colSpan={5} className="empty">
                  Nenhuma notificacao recebida ainda.
                </td>
              </tr>
            ) : (
              notifications.map((notification) => (
                <tr key={notification.id}>
                  <td>{formatDate(notification.receivedAt)}</td>
                  <td>{notification.appName || notification.packageName}</td>
                  <td>{notification.title || "-"}</td>
                  <td>{notification.bigText || notification.text || "-"}</td>
                  <td className="mono">{notification.packageName}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </section>
    </main>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "medium",
  }).format(new Date(value));
}
