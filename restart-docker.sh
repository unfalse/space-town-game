docker stop $(docker ps -q)
docker build -t space-town-game .
docker run -p 80:80 space-town-game