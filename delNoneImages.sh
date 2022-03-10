docker image rm $(docker image list | grep '<none>' | awk '{contIds=$3" "contIds} END {print contIds}')
