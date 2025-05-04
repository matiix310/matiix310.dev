set -e
set -x

# TODO find a way to run this script after the db initialization
# sleep 5

# migrate the db
cd backend
bunx drizzle-kit migrate

# start the main web server
./server