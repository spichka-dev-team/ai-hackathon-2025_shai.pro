# AGENTS.md

## AGENTS

> Audience: LLM-driven engineering agents

## AI Hackathon 2025 | shai.pro

├───.specstory
│   └───history (AI chat history)
├───assets (images, drawings in excalidraw)
├───sources (sources/references to useful articles/text contents)
├───docs (documents and informations about Hacakaton)
├───ARCHITECTURE.md (Architecture Of System, Uncompleted)
├───README.md ()
└───AGENTS.md (entrypoint, README.md file for LLM/Copilot model Context)

---

> shai.pro is like n8n.io (shai.pro is platform for creating AI agents)

## shai.pro Interface Capabilities

Studio:

CREATE APP
Create from Blank
Import DSL file

- All
- Chatbot
- Agent
- Completion
- Chatflow
- Workflow

---

Knowledge:

Create Knowledge
Import your own text data or write data in real-time via Webhook for LLM context enhancement.

---

Tools:

- Tools
- Custom (Create Custom Tools)
- Workflow

Code Interpreter
Run a piece of code and get the result back. #productivity

CurrentTime
A tool for getting the current time. #utilities

Audio
A tool for tts and asr. #utilities

WebScraper
Web Scrapper tool kit is used to scrape web #productivity

---

Code Interpreter

Run a piece of code and get the result back.
1 action INCLUDED
Code Interpreter
Run code and get the result back. When you're using a lower quality model, please make sure there are some tips help LLM to understand how to write the code.

Code Interpreter
Run code and get the result back. When you're using a lower quality model, please make sure there are some tips help LLM to understand how to write the code.
parameters
Language
string
Required
The programming language of the code
Code
string
Required
The code to be executed

---

CurrentTime

A tool for getting the current time.
5 actions INCLUDED
Timestamp to localtime
A tool for timestamp convert to localtime
Weekday Calculator
A tool for calculating the weekday of a given date.
Current Time
A tool for getting the current time.
convert time to equivalent time zone
A tool to convert time to equivalent time zone
localtime to timestamp
A tool for localtime convert to timestamp

---

Audio

A tool for tts and asr.
2 actions INCLUDED
Speech To Text
Convert audio file to text.
Text To Speech
Convert text to audio file.

Speech To Text
Convert audio file to text.
parameters
Audio File
file
Required
The audio file to be converted.

Text To Speech
Convert text to audio file.
parameters
Text
string
Required
The text to be converted.

---

Web Scrapper tool kit is used to scrape web
1 action INCLUDED
Web Scraper
A tool for scraping webpages.

Web Scraper
A tool for scraping webpages.
parameters
URL
string
Required
used for linking to webpages

---

Custom (Create Custom Tools)

Create Custom Tool
Name *
app logo
Enter the tool name
Available Tools
Name -> Description -> Method -> Path -> Actions
Authorization method
None
Tags
Choose tags(optional)
Privacy policy
Please enter privacy policy
Custom disclaimer

---

Workflow

No workflow tool available
Go to "Workflow -> Publish as Tool"

---

Settings

Settings
WORKSPACE
Model Provider
Members
Data Source
GENERAL
Language

ESC
Model Provider
Search
Models
The system model has not yet been fully configured
System Model Settings
Model provider not set up
Please install a model provider first.

---

System Reasoning Model
Configure model
Embedding Model
Configure model
Rerank Model
Configure model
Speech-to-Text Model
Configure model
Text-to-Speech Model
Configure model

---

Settings
WORKSPACE
Model Provider
Members
Data Source
GENERAL
Language

ESC
Data Source
Notion
Using Notion as a data source for the Knowledge.
Connect
Website
With Jina Reader
Import content from websites using web crawler.
Configure
Website
With 🔥 Firecrawl
Import content from websites using web crawler.
Configure
Website
With WaterCrawl
Import content from websites using web crawler.
Configure

---


STEP 1
Data Source
2
Document Processing
3
Execute & Finish
Data Source
Import from file
Sync from Notion
Sync from website
OCR Method
Default
Upload file
Drag and drop file or folder, orBrowse
Supports TXT, MARKDOWN, MDX, PDF, HTML, XLSX, XLS, DOCX, CSV, VTT, PROPERTIES, MD, HTM. Max 15MB each.

Next
I want to create an empty Knowledge

---

Workflow

Orchestrate
Logs
Планировщик
Monitoring

---

Workflow Logs
The log recorded the operation of Automate.

All
Last 7 Days
Search
Is anyone there?
Observe and annotate interactions between end-users and AI applications here to continuously improve AI accuracy. You can try sharing or testing the Web App yourself, then return to this page.

---

Планировщик
Здесь вы можете управлять кронтабом: добавлять новые задания, изменять расписание и следить за статусом выполнения
Поиск
Создать новый
Название -> Периодичность -> Время выполнения -> Статус -> Действия
Нет крон-заданий

---

To get started,
setup your model provider first.

Go to setup model provider
Or try the cloud version of Sherlock with free quote
Monitoring
app logo
testging
Ready-to-use AI web app
In Service

Public URL
[hackathon.shai.pro/workflow](http://hackathon.shai.pro/workflow/BM5nxEI8PiVk1LI6)

Launch

Settings
Analysis

Last 7 Days
Total Messages
Last 7 Days
0
Active Users
Last 7 Days
0
Token Usage
Last 7 Days
0
Avg. User Interactions
Last 7 Days
0

---

Orchestrate


Начало
Add description...
Input Field
Set inputs that can be used in the Workflow
sys.files
LEGACY
Array[File]
sys.user_id
String
sys.app_id
String
sys.workflow_id
String
sys.workflow_run_id
String
NEXT STEP
Add the next block in this workflow
LLM
Add Parallel Node


LLM
Add description...
model *
context
Set variable
vision

Output Variables
Structured

retry on failure

Error Handling
None
NEXT STEP
Add the next block in this workflow
Select Next Block

Blocks
Tools
LLM
Knowledge Retrieval
End
Agent
Question Understand
Question Classifier
Logic
IF/ELSE
Iteration
Loop
Transform
Code
Template
Variable Aggregator
Doc Extractor
Variable Assigner
Parameter Extractor
Utilities
HTTP Request
List Operator

---

Features
Enhance web app user experience
Image Upload
LEGACY

Allow uploading images.

### Context

#### Our Choosen Task

1 задача:
ИИ-секретарь для онлайн-встреч (Zoom/Meet → Jira)

Контекст:
После встреч задачи часто фиксируются вручную, часть поручений теряется, снижается дисциплина

Цель:
Создать агента, который подключается к Zoom/Meet, расшифровывает разговор и автоматически создает/обновляет задачи в Jira

Метрики:

- ML: точность распознавания речи (WER), качество выделения задач
- Бизнес: % задач, корректно заведенных в Jira, снижение времени на протоколирование
- UX: удобство для команды (опрос жюри)

Ценность:
Сокращение времени менеджеров, исключение потерь задач, рост продуктивности

---

#### Our Idea



---

#### Idea (Brainstorming Context) (Drafted)

RED LINE — превращает разговоры в результат
Операционная система коммуникаций

🔴 Проблема
 • Договорённости с митингов и звонков теряются.
 • Руководитель и PM не могут быть на всех встречах.
 • Чтобы понять статус проектов, нужны десятки сообщений и звонков.
🟢 Решение
 • RED LINE фиксирует итоги разговоров автоматически.
 • Превращает слова в задачи с ответственными.
 • Обновляет прогресс-бар по людям и проектам.
💎 Ценность
 • Руководитель и заказчик видят картину за 1 минуту.
 • PM получает журнал всех решений и обещаний.
 • Сотрудник видит простое «сделал → делаю → дальше».
 • Колл-центр фиксирует исходы звонков и быстро находит контекст.
⚡️ Отличие
 • Не таск-трекер: задачи рождаются из разговоров автоматически.
 • Не CRM: показывает живой прогресс команды, а не просто сделки.
 • Не мессенджер: сохраняет контекст и превращает слова в результат.

RED LINE — это инструмент, который убирает разрыв между словами и делами. Он фиксирует договорённости с митингов и звонков, превращает их в задачи с ответственными и показывает прогресс по команде.

---

Йоу

RED LINE — кратко для команды

Что это
Витрина «ситуации в моменте»: кто из команды что делает сейчас, что у него дальше, что блокирует и о чём договорились на созвонах.

Боль, которую закрываем
Договорённости теряются после звонков. Руководителю и заказчику непонятно, чем занята команда «прямо сейчас», начинаются пинги и лишние статусы. Статусы в трекере расходятся с реальностью.

Кому это нужно
Заказчику и руководителю — видеть картину за минуту.
PM — иметь единый журнал решений и обещаний.
Сотруднику — короткая ретро «что сделал/что дальше».
Колл-центру — фиксировать исходы разговоров.

Что показываем на одном экране
По людям и проекту: Now / Next / Blocked / Deadlines / Decisions (принятые решения) / Outcomes (итоги звонков) + «последний апдейт».

Чего здесь нет
Не таск-трекер, не планирование спринтов, не учёт часов и не диаграммы. Это слой поверх существующих инструментов, где важен текущий срез и журнал решений.

Обещание продукта
Слова не на ветер — каждое обещание превращается в конкретный пункт с владельцем и сроком. «Не беспокоить работающих»: нужная прозрачность без лишних сообщений.

Как выглядит успех
Руководитель понимает статус за 60 секунд. Пингов меньше. Просрочек меньше. Большинство договорённостей после созвонов зафиксированы и видны всей стороне.

---

подумайте над идей ещё раз, я там в общий чат расписал что-то.

чекните там диаграму Агентов и это сделаем именно Tracking (Tracker Management) который будет выводить статус задач/прогресса по проекту и тд.

идею нужно доработать в плане добавить ещё что то, тк как я описывал ИИ Агенты это автоматизация.

в плане того что оно unclear в концептах ИИ Агентов и Условий оценивания в Хакатонк, как я понял мы хотим сделать web интерфейс в котором будет закреплён статус.
мы это можем/незнаю сместить на то что в Чате с наших Агентом можно будет спрашивать об успехе/статусе самой задачи/прогресса по стартапу (ну и можно не только об прогрессе но и об других вещях тоже) и бизнес.

ИИ Агент это в основном чат бот интерфейсы в котором можно ему сказать аудио/текст Закажи мне пожалуйста пиццу на 6 вечера (и этот ИИ Агент закажет пиццу) или можно сказать, сегодня у меня будет Созвон в 10 утра, можешь его поставить в мои календарь, в календарь моих коллег, поставить будильник и поставить/сделать план/задачи на этот созвон, и также прислать уведомление на почты моих коллег и так далее (и он все это сделает).

---
эту идею сделаем! и это будет не так уж сложно если не искривляться.

и также как на диаграме этому можно выделить отдельного агента и веб сайт под него.

и также так как мы берём 1 задачу, мы можем/будем и так нужно - запихать tasker agent (task management) который будет делать вещички в Jira.

---

посмотрите на условия, критерии оценивания и задачи.

в основном AI Agent подразумевается автоматизацию каких то процессов в бизнесе (грубо это замена людей которые занимаются рутиной/немного креативом), например какую то рутину и немного креатива с помощью контекста RAG и понимание внутренних или локальных данных/знаний и также через MCP который по сути API шка для AI LLM models, в котором ИИ моделька может взаимодействовать с другими сервисами по типу Google Calendar, Gmail, Notion, Jira и так далее, а сами Agent это тупо Generative AI который LLM model, или же языковая моделька который генерирует текст и предугадает твои следующие сообщения на основе базы которое у него есть, прикол Agents у них есть RAG который ограничивает input data и делает так чтобы output data была качественным.

shai.pro это платформа для создание ИИ Агентов, и автоматизация каких то процессов.

shai.pro это по сути как n8n платформа.

---

основные термины:

- AI Agent, MCP, RAG
- Agent Orchestrator, Multi Agent System, Agent Memory
- LLM, GenAI, AI Model

почему агенты и почему они работают и зарабатывают дохера как бизнес модель и стартапы.

например есть hh в котором условно вакансия, на копирайтера за 200к - 500к тенге,
и эту должность можно заменить ИИ Агентом который будет делать это вместо человека (почти что полностью или даже полностью),

Люди делают ИИ Агента и SaaS сервис для таких бизнесов (или условно можно сказать что они просто нанимаются сами/и потом тупо закрепляют к ИИ Агенту), в котором subscription модель или монетизация идёт по типу: я предлагаю тебе решение и даю тебе Агента Копирайтера который будет делать каждый день пост в Телеграм/Инстаграм и к дополнению будет иногда кидать Емайл уведомления (по типу это все работа копирайтера), который будет стоить не 200-500к тенге а будет стоить 100-250к тенге, также компания сократит расходы на найм, увольнение, обучение нового сотрудника, так как этому новому ИИ Агент сотруднику не нужно не спать, не увольняться, не нанимать и другие/прочие расходы и пережить головную боль и так далее.

так как компания выделила на Должность бюджет на вакансию Копирайтера, тогда это значит что это проблема/нужда компаний и они хотят нанять копирайтера и исправить это.

если взять 100к за одного клиента, за одну подписку в один месяц, тогда за 100 клиентов будет 10 лямов, или просто 10 клиентов будут 1 лям

---

#### Requirements

Технические Условия
Модели LLM:

- мы предоставляем доступ к Llama 4 Scout fp8, но не ограничиваем выбором моделей при условии, что они полностью открыты
- обязательным условием является использование open-source моделей

---

Критерии

Критерии оценивания

Категория

Критерий

Описание метрики

Макс.
баллы

Бизнес-ценность

Решение реальной боли
бизнеса

Бизнес-ценность

Интегрируемость в
рабочие процессы

Бизнес-ценность

Оценка экономического
эффекта

Качество

ML/AI-решения

Техническая точность
моделей

Качество

ML/AI-решения

Надежность и
устойчивость

Качество

ML/AI-решения

Инновационность подхода

Агентная
архитектура

Корректность
декомпозиции задачи

Агентная
архитектура

Оркестрация и
взаимодействие агентов

Агентная
архитектура

Использование best
practices (memory, tools,
reasoning)

Насколько решение закрывает
заявленную бизнес-проблему (например,
автоматизация бухгалтерии, контроль
полок, анализ звонков).

Важен реальный бизнес-кейс,

а не просто ML-демо.

Можно ли встроить решение в
существующую ИТ-среду (SAP, 1С, CRM,
ERP, корпоративные API). Оценка
архитектуры интеграции и API-first
подхода.

Есть ли расчет/оценка сокращения
времени, снижения издержек или роста
эффективности.

Пример: экономия человеко-часов
бухгалтерии, рост конверсии в продажах.

Метрики качества ML по задаче: Recall@k
для RAG, WER для Voice, Precision/Recall
для модерации, Accuracy для CV, F1-score
для NLP. Чем выше качество – тем лучше.

Как решение работает на реальных
'грязных' данных: OCR на сканах, шум в
аудио, неструктурированные тексты.
Также учитывается стабильность при
нагрузке.

Использование современных методов:
мультимодальные модели, Advanced RAG,
Workflow orchestration, custom Function
Calling. Новизна и оригинальность
решения.

Задача разбита на корректных агентов:
ChatBot, RAG, Function Calling, Workflow.
Каждый агент решает свой подзадачу.

Есть ли workflow или мультиагентные
сценарии, где агенты взаимодействуют
между собой.

Пример: RAG → Function Calling → отчет.

Применяются ли память агента,
инструментальные вызовы и цепочки
reasoning. Продвинутая агентная логика
повышает оценку.

15

10

5

15

10

5

10

5

5

Критерии

Критерии оценивания

Категория

Критерий

Описание метрики

Макс.
баллы

UX и демонстрация

Понятность интерфейса и
UX

UX и демонстрация Качество демо

Инженерная часть

Интеграция с внешними
системами/API

Инженерная часть

Оптимизация и
производительность

Бонусы

Использование

low-code платформы
shai.pro

Интерфейс понятен конечному
пользователю (бухгалтер, менеджер,
клиент). Простота и удобство важнее
технической сложности.

Насколько убедительно показан end-to-
end сценарий: загрузка данных → работа
агента → бизнес-результат.

Подключены ли реальные API (Zoom, Jira,
SAP, 1С, CRM). Насколько хорошо
отлажены вызовы и передача данных.

Время ответа, стабильность при нагрузке,
масштабируемость. Учитывается скорость
работы и отказоустойчивость.

Команда реализовала решение на нашей
low-code платформе для агентов.
Показывает готовность к интеграции и
снижает входной порог.

5

5

5

5

10
