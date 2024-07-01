nvm use 20;


alias npmstart='cd ~/cccloud/frontend && export $(cat .env/dev.env) && npm start'



alias uvistart='cd ~/cccloud && mkactvenv && uvicorn app.main:app --host 0.0.0.0 --reload'


alias reloadstart='cd ~/cccloud && . ./shell.sh'





