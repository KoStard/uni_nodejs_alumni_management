This Docker based application provides an easy example where a NGINX server is used as a proxy to three nodes of the same Node.js backend, that connects to a single shared Redis DB.

The example code is rather trivial, since it only stores a counter value in Redis and presents the current counter value on the welcome webpage.

**Note:** the number of nodes is currently hard-coded in the docker-compose.yml file.