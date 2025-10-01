fx_version 'cerulean'
game 'gta5'

author 'An awesome dude'
description 'An awesome, but short, description'
version '1.0.0'

client_scripts {
	'build/client/client.js'
}

server_scripts {
	'build/server/server.js'
}

-- specify the root page, relative to the resource
ui_page 'nui/main.html'

-- every client-side file still needs to be added to the resource packfile!
files {
    'nui/main.html',
    'nui/main.js',
    'nui/main.css'
}