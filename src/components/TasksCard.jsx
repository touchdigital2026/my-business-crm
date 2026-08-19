import { useState } from 'react'
import { todayTasks } from '../data/mockData.js'

export default function TasksCard() {
  const [tasks, setTasks] = useState(todayTasks)

  function toggle(id) {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t)))
  }

  const doneCount = tasks.filter((t) => t.done).length

  return (
    <section className="card">
      <div className="card__head">
        <div>
          <h2 className="card__title">המשימות שלי היום</h2>
          <p className="card__subtitle">
            הושלמו {doneCount} מתוך {tasks.length}
          </p>
        </div>
      </div>

      {/* מד התקדמות – מראה כמה מהמשימות כבר בוצעו */}
      <div className="progress">
        <div
          className="progress__fill"
          style={{ width: `${(doneCount / tasks.length) * 100}%` }}
        />
      </div>

      <ul className="tasks">
        {tasks.map((task) => (
          <li key={task.id} className={`tasks__item ${task.done ? 'is-done' : ''}`}>
            <label className="tasks__label">
              <input
                type="checkbox"
                checked={task.done}
                onChange={() => toggle(task.id)}
              />
              <span className="tasks__box">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path
                    d="M5 12.5l4.5 4.5L19 7"
                    stroke="#fff"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
              <span className="tasks__title">{task.title}</span>
            </label>
            <span className="tasks__time">{task.time}</span>
          </li>
        ))}
      </ul>
    </section>
  )
}
