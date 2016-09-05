IP=$1
HOST=$2
SERVER_DIR=$3
CLIENT_DIR=$4

DOC_ROOT="/var/www/$HOST"
VAGRANT_ROOT="$DOC_ROOT/vagrant"
SERVER_ROOT=$([ "$SERVER_DIR" == '' ] && echo "$DOC_ROOT" || echo "$DOC_ROOT/$SERVER_DIR")
CLIENT_ROOT=$([ "$CLIENT_DIR" == '' ] && echo "$DOC_ROOT" || echo "$DOC_ROOT/$CLIENT_DIR")

#Prevent debconf from having to look for stdin
export DEBIAN_FRONTEND=noninteractive
sudo debconf-set-selections <<< "grub-pc	grub-pc/install_devices	multiselect	/dev/sda"

# update / upgrade
sudo apt-get update
sudo apt-get -y upgrade

# install curl
sudo apt-get install -y curl

#install server utils
sudo apt-get install -y vim
sudo apt-get install -y htop

# install latest version of git
sudo apt-add-repository -y ppa:git-core/ppa
sudo apt-get -y update
sudo apt-get -y install git

# install node.js
curl -sL https://deb.nodesource.com/setup | sudo bash -
sudo apt-get -y install nodejs

# install latest npm
sudo npm -g install npm@latest

# install pm2
sudo npm install pm2 -g

# install mongodb
sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv EA312927
echo "deb http://repo.mongodb.org/apt/ubuntu trusty/mongodb-org/3.2 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-3.2.list

sudo apt-get update
sudo apt-get install -y mongodb-org

# install grunty-grunt
sudo npm install -g grunt-cli

# install grunt & bower
sudo npm install -g bower

# yo scaffolding tool
sudo npm install -g yo

if [ -e "$VAGRANT_ROOT/provisions/config.sh" ]; then
	cd $VAGRANT_ROOT/provisions
	sudo chmod +x config.sh
	sudo chmod -r +x scripts/
	sudo ./config.sh
fi