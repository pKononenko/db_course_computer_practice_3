# db_course_computer_practice_3 (КП-3. Кононенко Павло КМ-81)
Комп'ютерний практикум - 3 з дисципліни Бази Даних. Кононенко Павло КМ-81

# Посилання на розгорнутий застосунок на Heroku
https://dbis-lab4-deadline-front.herokuapp.com/

# Запуск локально
Для локального запуску необхідно ввести дві команди.

Для запуску api з базою даних (Flask, Postgres): ```yarn start-api```

Для запуску frontend (React): ```yarn start```

# Розгортання на Heroku

Для розгортання на хероку необхідно просто додати основні зміни в репозиторій для api та frontend, адже вони знаходяться на різних heroku app. Спочатку, додати посилання на віддалені репозиторії heroku:

* Для api: ```heroku git:remote -a dbis-lab4-deadline-back```
* Для frontend: ```heroku git:remote -a dbis-lab4-deadline-front```

Для api та frontend:

```git add .```

```git commit -m <some message>```

```git push heroku master```

Після цього, застосунки знаходяться за посиланнями:
* api:      https://dbis-lab4-deadline-back.herokuapp.com/
* frontend: https://dbis-lab4-deadline-front.herokuapp.com/
