# Ship Checklist — Chess Sensei

Тебе осталось сделать **6 шагов** чтобы сдать. Иди по порядку, не прыгай.

---

## 1. Распакуй и установи (5 мин)

```bash
unzip chess-sensei.zip
cd chess-sensei
npm install
```

Если `npm install` упал — у тебя нет Node.js 18+. Поставь с https://nodejs.org/

## 2. Запусти локально без бэкенда (2 мин)

```bash
npm run dev
```

Открой http://localhost:5173. Должны работать:
- Главная с выбором сэнсэя
- Партия против Stockfish (или fallback-движка, если CDN заблокирован)
- Таблицы лидеров (пустые) и Pro page

**Что НЕ работает локально пока что:**
- AI-комментарий от сэнсэя (нужен бэкенд + ключ Anthropic)
- Реальный лидерборд (нужен Supabase)

Это ок. Дальше включим.

## 3. Создай GitHub репозиторий (3 мин)

```bash
git init
git add .
git commit -m "Initial commit: Chess Sensei MVP"
git branch -M main
# Создай пустой репо на github.com/new — назови chess-sensei
git remote add origin https://github.com/<твой-юзер>/chess-sensei.git
git push -u origin main
```

## 4. Поставь Supabase (10 мин) — для лидерборда

1. Зарегайся на https://supabase.com
2. Создай проект (бесплатный tier)
3. **SQL Editor → New query** → вставь содержимое `supabase/schema.sql` → Run
4. **Authentication → Providers** → найди **Anonymous** → включи
5. **Settings → API** → скопируй:
   - `Project URL` → пойдёт в `VITE_SUPABASE_URL`
   - `anon public` ключ → пойдёт в `VITE_SUPABASE_ANON_KEY`

## 5. Получи Anthropic API ключ (3 мин) — для сэнсэя

1. Зарегайся на https://console.anthropic .com
2. Положи $5 на счёт (этого хватит на ~3000 анализов партий)
3. **API Keys → Create Key** → скопируй ключ (`sk-ant-...`)
4. Это пойдёт в `ANTHROPIC_API_KEY`

## 6. Деплой на Vercel (5 мин)

1. Зайди на https://vercel.com → войти через GitHub
2. **Add New → Project** → выбери репо `chess-sensei`
3. Не меняй настройки сборки (Vite определится сам)
4. **Environment Variables** → добавь все три:
   - `ANTHROPIC_API_KEY`
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
5. **Deploy**

Через ~2 минуты получишь ссылку типа `chess-sensei-xxx.vercel.app`.

## 7. Проверь и сдай

Открой свою Vercel-ссылку. Сыграй партию до конца. Должно быть:
- ✅ Доска работает, фигуры двигаются по правилам
- ✅ Stockfish (или fallback) отвечает на ходы
- ✅ После мата/ничьей появляется окно с анализом сэнсэя
- ✅ Кнопка "Post to Ladder" сохраняет в лидерборд
- ✅ Страница /leaderboard показывает игроков

Если всё норм — **сдавай форму:**
https://nfactorialschool.typeform.com/to/HYVeKeEx

В форму вписать:
- Ссылка на проект: `https://chess-sensei-xxx.vercel.app`
- Ссылка на репо: `https://github.com/<твой-юзер>/chess-sensei`
- Описание уже в README.md

---

## Если что-то пошло не так

**Stockfish не загружается / fallback-движок слишком слабый**
→ Норм, fallback это safety net, рейтинг всё равно работает. Но если хочешь чинить:
открой devtools → Network → проверь, что `https://cdn.jsdelivr.net/npm/stockfish.js@10.0.2/stockfish.js` доступен.

**Сэнсэй не отвечает после игры**
→ В Vercel: Functions → /api/analyze → Logs. Скорее всего ANTHROPIC_API_KEY не задан или не сохранился.

**Лидерборд пустой даже после партии**
→ Supabase → Authentication → Providers → проверь, что Anonymous включён.
И Table Editor → profiles → проверь, есть ли строка с твоим username.

**Запутался — залит код, но что-то ведёт себя криво**
→ Открой devtools (F12) → Console. Любая красная строка скажет, в чём дело.
