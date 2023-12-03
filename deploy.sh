SERVER=34.68.68.156
docker build --squash -t frontend -f frontend.dockerfile .
docker save frontend | bzip2 | pv | ssh $SERVER docker load
docker build --squash -t backend -f backend.dockerfile .
docker save backend | bzip2 | pv | ssh $SERVER docker load
ssh $SERVER docker-compose down --remove-orphans
ssh $SERVER  docker rmi $(docker images --filter "dangling=true" -q --no-trunc)
scp docker-compose.yml $SERVER:.
scp .env $SERVER:.
ssh $SERVER docker-compose up -d