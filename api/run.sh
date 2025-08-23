set -e
set -x

# TODO find a way to run this script after the db initialization
# sleep 5

# migrate the db
bunx drizzle-kit migrate

if [ "$1" == "dev" ]; then
    bun run dev
else
    # start the main web server
    ./server
fi

