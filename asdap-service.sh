cd /home/devops/cd-sio/
npm install npm i ts-node typescript
cd /home/devops/cd-api/
npm install npm i ts-node typescript
chmod +x /home/devops/cd-api/src/app.ts
chmod +x /home/devops/cd-sio/src/app.ts
sudo cp /home/devops/cd-api/src/CdApi/app/coops/asdap.service /etc/systemd/system/
sudo cp /home/devops/cd-api/src/CdApi/app/coops/asdap-sio.service /etc/systemd/system/
sudo rm -f /usr/bin/node
bash -c 'sudo ln -s "$(which node)" /usr/bin/node'
# bash -c 'sudo ln -s /usr/bin/nodejs /usr/bin/node'
sudo systemctl daemon-reload
sudo systemctl start asdap
sudo systemctl start asdap-sio
sudo systemctl enable asdap
sudo systemctl enable asdap-sio
# sudo journalctl -u asdap
# sudo journalctl -u asdap-sio
# sudo journalctl --unit=asdap -n 30 --no-pager



