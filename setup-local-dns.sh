#!/bin/bash

echo "Setting up local DNS for Where To Next..."

IP=$(ifconfig | grep "inet " | grep -v 127.0.0.1 | awk '{print $2}' | head -1)

echo "Found IP address: $IP"

if grep -q "where-to-next.local" /etc/hosts; then
    echo "where-to-next.local already exists in /etc/hosts"
    echo "Current entry:"
    grep "where-to-next.local" /etc/hosts
else
    echo "Adding where-to-next.local to /etc/hosts..."
    echo "$IP where-to-next.local" | sudo tee -a /etc/hosts
    echo "Added: $IP where-to-next.local"
fi

echo ""
echo "Setup complete!"
echo ""
echo "Now you can access your website at:"
echo "   http://where-to-next.local:3000"
echo ""
echo "To start the servers, run:"
echo "   ./start-network.sh"
