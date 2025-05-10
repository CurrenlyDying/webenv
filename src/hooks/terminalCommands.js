// Commands for the terminal emulator
export const createCommandList = (fileSystemFunctions) => {
  const {
    getNodeAtPath,
    resolvePath,
    currentDirectory,
    setCurrentDirectory,
    setFileSystem,
    env
  } = fileSystemFunctions;

  // Standard commands
  const standardCommands = {
    ls: (args) => {
      const options = args.filter(arg => arg.startsWith('-'));
      const showAll = options.some(opt => opt.includes('a'));
      const showLong = options.some(opt => opt.includes('l'));
      
      let targetPath = args.filter(arg => !arg.startsWith('-'))[0] || '.';
      targetPath = resolvePath(targetPath);
      
      const { node } = getNodeAtPath(targetPath);
      
      if (!node) return `ls: cannot access '${targetPath}': No such file or directory`;
      if (node.type !== 'directory') return `ls: cannot list '${targetPath}': Not a directory`;
      
      const contents = Object.entries(node.contents)
        .filter(([name]) => showAll || !name.startsWith('.'))
        .sort(([a], [b]) => a.localeCompare(b));
      
      if (contents.length === 0) return '';
      
      if (showLong) {
        return contents.map(([name, item]) => {
          const type = item.type === 'directory' ? 'd' : '-';
          const size = item.size || (item.type === 'directory' ? 4096 : 0);
          const date = new Date(item.modified || new Date()).toLocaleString();
          return `${type}rwxr-xr-x 1 user user ${size.toString().padStart(8)} ${date} ${name}${item.type === 'directory' ? '/' : ''}`;
        }).join('\n');
      }
      
      return contents.map(([name, item]) => `${name}${item.type === 'directory' ? '/' : ''}`).join('  ');
    },
    
    cd: (args) => {
      if (args.length === 0) {
        setCurrentDirectory('/home/user');
        return '';
      }
      
      const targetPath = resolvePath(args[0]);
      const { node } = getNodeAtPath(targetPath);
      
      if (!node) return `cd: no such directory: ${args[0]}`;
      if (node.type !== 'directory') return `cd: not a directory: ${args[0]}`;
      
      setCurrentDirectory(targetPath);
      return '';
    },
    
    mkdir: (args) => {
      if (args.length === 0) return 'mkdir: missing operand';
      
      const results = [];
      
      for (const arg of args) {
        const targetPath = resolvePath(arg);
        const parentPath = targetPath.substring(0, targetPath.lastIndexOf('/')) || '/';
        const dirName = targetPath.split('/').pop();
        
        const { node: parentNode } = getNodeAtPath(parentPath);
        
        if (!parentNode) {
          results.push(`mkdir: cannot create directory '${arg}': No such file or directory`);
          continue;
        }
        
        if (parentNode.type !== 'directory') {
          results.push(`mkdir: cannot create directory '${arg}': Not a directory`);
          continue;
        }
        
        if (parentNode.contents[dirName]) {
          results.push(`mkdir: cannot create directory '${arg}': File exists`);
          continue;
        }
        
        // Create directory
        setFileSystem(prevFs => {
          const newFs = JSON.parse(JSON.stringify(prevFs));
          let current = newFs['/'];
          
          if (parentPath === '/') {
            current.contents[dirName] = {
              type: 'directory',
              contents: {},
            };
            return newFs;
          }
          
          const parts = parentPath.split('/').filter(Boolean);
          for (const part of parts) {
            current = current.contents[part];
          }
          
          current.contents[dirName] = {
            type: 'directory',
            contents: {},
          };
          
          return newFs;
        });
      }
      
      return results.join('\n') || '';
    },
    
    touch: (args) => {
      if (args.length === 0) return 'touch: missing file operand';
      
      const results = [];
      
      for (const arg of args) {
        const targetPath = resolvePath(arg);
        const parentPath = targetPath.substring(0, targetPath.lastIndexOf('/')) || '/';
        const fileName = targetPath.split('/').pop();
        
        const { node: parentNode } = getNodeAtPath(parentPath);
        
        if (!parentNode) {
          results.push(`touch: cannot touch '${arg}': No such file or directory`);
          continue;
        }
        
        if (parentNode.type !== 'directory') {
          results.push(`touch: cannot touch '${arg}': Not a directory`);
          continue;
        }
        
        setFileSystem(prevFs => {
          const newFs = JSON.parse(JSON.stringify(prevFs));
          let current = newFs['/'];
          
          if (parentPath === '/') {
            // Create or update file at root
            if (current.contents[fileName]) {
              current.contents[fileName].modified = new Date().toISOString();
            } else {
              current.contents[fileName] = {
                type: 'file',
                content: '',
                size: 0,
                created: new Date().toISOString(),
                modified: new Date().toISOString(),
              };
            }
            return newFs;
          }
          
          const parts = parentPath.split('/').filter(Boolean);
          for (const part of parts) {
            current = current.contents[part];
          }
          
          if (current.contents[fileName]) {
            current.contents[fileName].modified = new Date().toISOString();
          } else {
            current.contents[fileName] = {
              type: 'file',
              content: '',
              size: 0,
              created: new Date().toISOString(),
              modified: new Date().toISOString(),
            };
          }
          
          return newFs;
        });
      }
      
      return results.join('\n') || '';
    },
    
    cat: (args) => {
      if (args.length === 0) return 'cat: missing file operand';
      
      const results = [];
      
      for (const arg of args) {
        const targetPath = resolvePath(arg);
        const { node } = getNodeAtPath(targetPath);
        
        if (!node) {
          results.push(`cat: ${arg}: No such file or directory`);
          continue;
        }
        
        if (node.type === 'directory') {
          results.push(`cat: ${arg}: Is a directory`);
          continue;
        }
        
        results.push(node.content);
      }
      
      return results.join('\n');
    },

    rm: (args) => {
      if (args.length === 0) return 'rm: missing operand';
      
      const recursive = args.includes('-r') || args.includes('-R') || args.includes('-rf');
      const force = args.includes('-f') || args.includes('-rf');
      const paths = args.filter(arg => !arg.startsWith('-'));
      
      if (paths.length === 0) return 'rm: missing operand';
      
      const results = [];
      
      for (const arg of paths) {
        const targetPath = resolvePath(arg);
        const parentPath = targetPath.substring(0, targetPath.lastIndexOf('/')) || '/';
        const nodeName = targetPath.split('/').pop();
        
        const { node } = getNodeAtPath(targetPath);
        
        if (!node) {
          if (!force) results.push(`rm: cannot remove '${arg}': No such file or directory`);
          continue;
        }
        
        if (node.type === 'directory' && !recursive) {
          results.push(`rm: cannot remove '${arg}': Is a directory`);
          continue;
        }
        
        setFileSystem(prevFs => {
          const newFs = JSON.parse(JSON.stringify(prevFs));
          let current = newFs['/'];
          
          if (parentPath === '/') {
            delete current.contents[nodeName];
            return newFs;
          }
          
          const parts = parentPath.split('/').filter(Boolean);
          for (const part of parts) {
            current = current.contents[part];
          }
          
          delete current.contents[nodeName];
          return newFs;
        });
      }
      
      return results.join('\n') || '';
    },
    
    cp: (args) => {
      if (args.length < 2) return 'cp: missing destination file operand';
      
      const sourcePath = resolvePath(args[0]);
      const destPath = resolvePath(args[args.length - 1]);
      const { node: sourceNode } = getNodeAtPath(sourcePath);
      
      if (!sourceNode) return `cp: cannot stat '${args[0]}': No such file or directory`;
      
      if (sourceNode.type === 'file') {
        const destParentPath = destPath.substring(0, destPath.lastIndexOf('/')) || '/';
        const destName = destPath.split('/').pop();
        const { node: destParent } = getNodeAtPath(destParentPath);
        
        if (!destParent) return `cp: cannot create regular file '${args[args.length - 1]}': No such file or directory`;
        if (destParent.type !== 'directory') return `cp: cannot create regular file '${args[args.length - 1]}': Not a directory`;
        
        setFileSystem(prevFs => {
          const newFs = JSON.parse(JSON.stringify(prevFs));
          let currentDest = newFs['/'];
          
          if (destParentPath !== '/') {
            const parts = destParentPath.split('/').filter(Boolean);
            for (const part of parts) {
              currentDest = currentDest.contents[part];
            }
          }
          
          currentDest.contents[destName] = JSON.parse(JSON.stringify(sourceNode));
          return newFs;
        });
        
        return '';
      }
      
      return `cp: -r not specified; omitting directory '${args[0]}'`;
    },
    
    mv: (args) => {
      if (args.length < 2) return 'mv: missing destination file operand';
      
      const sourcePath = resolvePath(args[0]);
      const destPath = resolvePath(args[args.length - 1]);
      const { node: sourceNode } = getNodeAtPath(sourcePath);
      
      if (!sourceNode) return `mv: cannot stat '${args[0]}': No such file or directory`;
      
      const sourceParentPath = sourcePath.substring(0, sourcePath.lastIndexOf('/')) || '/';
      const sourceName = sourcePath.split('/').pop();
      
      const destParentPath = destPath.substring(0, destPath.lastIndexOf('/')) || '/';
      const destName = destPath.split('/').pop();
      
      const { node: destParent } = getNodeAtPath(destParentPath);
      
      if (!destParent) return `mv: cannot move '${args[0]}' to '${args[args.length - 1]}': No such file or directory`;
      if (destParent.type !== 'directory') return `mv: cannot move '${args[0]}' to '${args[args.length - 1]}': Not a directory`;
      
      setFileSystem(prevFs => {
        const newFs = JSON.parse(JSON.stringify(prevFs));
        let sourceParent = newFs['/'];
        let currentDest = newFs['/'];
        
        if (sourceParentPath !== '/') {
          const parts = sourceParentPath.split('/').filter(Boolean);
          for (const part of parts) {
            sourceParent = sourceParent.contents[part];
          }
        }
        
        if (destParentPath !== '/') {
          const parts = destParentPath.split('/').filter(Boolean);
          for (const part of parts) {
            currentDest = currentDest.contents[part];
          }
        }
        
        currentDest.contents[destName] = JSON.parse(JSON.stringify(sourceParent.contents[sourceName]));
        delete sourceParent.contents[sourceName];
        
        return newFs;
      });
      
      return '';
    },
    
    echo: (args) => {
      const output = args.join(' ');
      
      // Handle redirection
      const redirectIndex = output.indexOf('>');
      if (redirectIndex >= 0) {
        const text = output.substring(0, redirectIndex).trim();
        const filePath = output.substring(redirectIndex + 1).trim();
        
        if (!filePath) return 'echo: syntax error near unexpected token';
        
        const targetPath = resolvePath(filePath);
        const parentPath = targetPath.substring(0, targetPath.lastIndexOf('/')) || '/';
        const fileName = targetPath.split('/').pop();
        
        const { node: parentNode } = getNodeAtPath(parentPath);
        
        if (!parentNode) return `echo: ${filePath}: No such file or directory`;
        if (parentNode.type !== 'directory') return `echo: ${filePath}: Not a directory`;
        
        // Create or overwrite file
        setFileSystem(prevFs => {
          const newFs = JSON.parse(JSON.stringify(prevFs));
          let current = newFs['/'];
          
          if (parentPath === '/') {
            current.contents[fileName] = {
              type: 'file',
              content: text,
              size: text.length,
              created: new Date().toISOString(),
              modified: new Date().toISOString(),
            };
            return newFs;
          }
          
          const parts = parentPath.split('/').filter(Boolean);
          for (const part of parts) {
            current = current.contents[part];
          }
          
          current.contents[fileName] = {
            type: 'file',
            content: text,
            size: text.length,
            created: new Date().toISOString(),
            modified: new Date().toISOString(),
          };
          
          return newFs;
        });
        
        return '';
      }
      
      return output;
    },
    
    pwd: () => currentDirectory,
    
    clear: () => '\x1B[2J\x1B[0;0H',
    
    // System commands
    help: (args) => {
      if (args.length > 0) {
        const command = args[0];
        if (commandHelp[command]) {
          return `${command}: ${commandHelp[command]}`;
        }
        return `help: no help topics match '${command}'`;
      }
      
      return `Available commands: 
Basic commands:
  help      - Display this help text
  ls        - List directory contents
  cd        - Change directory
  pwd       - Print working directory
  mkdir     - Make directories
  touch     - Create empty files
  cat       - Concatenate files and print on the standard output
  rm        - Remove files or directories
  echo      - Display a line of text
  clear     - Clear the terminal screen
  
Use 'help [command]' for information on a specific command.
For more fun commands, try 'funhelp'.`;
    },
    
    man: (args) => {
      if (args.length === 0) return 'What manual page do you want?';
      
      const command = args[0];
      
      if (commandHelp[command]) {
        return `NAME
       ${command} - ${commandHelp[command]}
       
SYNOPSIS
       ${commandSynopsis[command] || command + ' [OPTION]... [FILE]...'}
       
DESCRIPTION
       ${commandDescription[command] || 'No detailed description available for this command.'}`;
      }
      
      return `No manual entry for ${command}`;
    },
    
    whoami: () => env.USER,
    
    date: () => new Date().toString(),
    
    exit: () => 'Cannot exit from this shell',
  };

  // Fun commands
  const funCommands = {
    funhelp: () => {
      return `Fun commands available in this terminal:

  fortune    - Display a random fortune cookie
  cowsay     - Generate an ASCII picture of a cow with a message
  asciiquarium - Enjoy an ASCII art aquarium
  sl         - See a steam locomotive run across your screen
  figlet     - Make large letters out of ordinary text
  cmatrix    - Display The Matrix in the terminal
  nyancat    - Display the nyan cat animation
  tetris     - Play Tetris in the terminal
  snake      - Play Snake in the terminal
  weather    - Get a weather forecast
  dice       - Roll dice with specified sides
  timer      - Set a countdown timer
  joke       - Get a random joke
  quote      - Get a random inspirational quote
  
I put like 200 commands in this stupid terminal emulator go find them, good luck`;
    },
    
    fortune: () => {
      const fortunes = [
        "Your code will work on the first try. Just kidding.",
        "There is a bug in your future. Actually there's probably multiple bugs.",
        "The best code is the code you don't have to write.",
        "The cloud is just someone else's computer.",
        "The programmer who says his code will work the first time has clearly been using Stack Overflow.",
        "Documentation is like a rare Pokémon, hard to find but valuable when you do.",
        "A clean codebase is like a unicorn: everyone talks about it, but few have actually seen one.",
        "Your code will never be bug-free, but it can be 'bug-less-likely'.",
        "The more I C, the less I see.",
        "It works on my machine!",
      ];
      
      return fortunes[Math.floor(Math.random() * fortunes.length)];
    },
    
    cowsay: (args) => {
      const message = args.join(' ') || 'Moo!';
      const line = '-'.repeat(message.length + 2);
      
      return `
 ${'_'.repeat(message.length + 2)}
< ${message} >
 ${'-'.repeat(message.length + 2)}
        \\   ^__^
         \\  (oo)\\_______
            (__)\\       )\\/\\
                ||----w |
                ||     ||`;
    },
    
    figlet: (args) => {
      const text = args.join(' ') || 'Hello!';
      
      // Simplified ASCII art text
      let result = '';
      
      for (const char of text) {
        switch (char.toUpperCase()) {
          case 'A':
            result += '  _  \n / \\ \n/___\\\n';
            break;
          case 'B':
            result += '___ \n|__]\n|__]\n';
            break;
          case 'C':
            result += ' __ \n/  \n\\__\n';
            break;
          default:
            result += ' _ \n| |\n|_|\n';
        }
      }
      
      return result;
    },
    
    cmatrix: () => 'Simulating The Matrix animation... (Press Ctrl+C to exit the Matrix)',
    
    sl: () => `
                        (@@) (  ) (@)  ( )  @@    ()    @     O     @
                   (   )
               (@@@@)
            (    )

          (@@@)
      ====        ________                ___________
          \\|      /        \\___/     \\            \\
           | /    |                   |             \\____
           |     |                     \\_______________|
           |     \\_____                         ||
           \\            \\                   _||
            \\________    \\___________    /|||||
                     \\                 | ||||||
                      \\_______________||__|||||
                                   ||
          H  H     OOOOO     OOOOO   |   _____________
         H    H   O     O   O     O  |  |             |
         HHHHHH   O     O   O     O  |  |_____________|
         H    H   O     O   O     O  |  |             |
         H    H    OOOOO     OOOOO   |  |_____________|
`,
    
    asciiquarium: () => 'Displaying ASCII aquarium... (Press Ctrl+C to exit)',
    
    nyancat: () => `
+      o     +              o
    +             o     +       +
o          +
    o  +           +        +
+        o     o       +        o
-_-_-_-_-_-_-_,------,      o
_-_-_-_-_-_-_-|   /\\_/\\
-_-_-_-_-_-_-~|__( ^ .^)
_-_-_-_-_-_-_-""  ""
+      o         o   +       o
    +         +
o        o         o      o     +
    o           +
+      +     o        o      +

Nyan cat animation is running... (Press Ctrl+C to stop it)`,
    
    tetris: () => 'Starting Tetris game... (not really)',
    
    snake: () => 'Starting Snake game... (press Ctrl+C to quit)',
    
    joke: () => {
      const jokes = [
        "Why do programmers prefer dark mode? Because light attracts bugs!",
        "Why was the JavaScript developer sad? Because he didn't Node how to Express himself!",
        "Why do Java developers wear glasses? Because they don't C#!",
        "How many programmers does it take to change a light bulb? None, that's a hardware problem!",
        "Debugging is like being the detective in a crime movie where you're also the murderer.",
      ];
      
      return jokes[Math.floor(Math.random() * jokes.length)];
    },
    
    quote: () => {
      const quotes = [
        "The best way to predict the future is to invent it. - Alan Kay",
        "Programming isn't about what you know; it's about what you can figure out. - Chris Pine",
        "The only way to learn a new programming language is by writing programs in it. - Dennis Ritchie",
        "Code is like humor. When you have to explain it, it's bad. - Cory House",
        "First, solve the problem. Then, write the code. - John Johnson",
      ];
      
      return quotes[Math.floor(Math.random() * quotes.length)];
    },
    
    weather: (args) => {
      const locations = [
        "New York", "London", "Tokyo", "Paris", "Sydney"
      ];
      
      const conditions = [
        "Sunny", "Cloudy", "Rainy", "Snowy", "Windy", "Stormy"
      ];
      
      const location = args[0] || locations[Math.floor(Math.random() * locations.length)];
      const condition = conditions[Math.floor(Math.random() * conditions.length)];
      const temp = Math.floor(Math.random() * 40 - 10);
      
      return `Weather for ${location}:
Condition: ${condition}
Temperature: ${temp}°C / ${Math.floor(temp * 9/5 + 32)}°F
Humidity: ${Math.floor(Math.random() * 100)}%
Wind: ${Math.floor(Math.random() * 30)} km/h`;
    },
    
    dice: (args) => {
      const sides = parseInt(args[0]) || 6;
      return `Rolling a ${sides}-sided die: ${Math.floor(Math.random() * sides) + 1}`;
    },
  };

  // Game commands
  const gameCommands = {
    pacman: () => `
.-.   .-.
|   '-'   |
|         |
 '-._____-'
Pacman game starting... (Press Ctrl+C to exit)`,
    
    mario: () => `
    ▄████▄
  ▄██████████▄
▄██▀██▄██▄██▀██▄
███▒▒▒▒▒▒▒▒▒▒███
███▒▒▄████▄▒▒███
██▀▒▒█▀▒▒▀█▒▒▀██
██▒▒▒▒▀████▀▒▒▒██
██▒▒▒▒▒▒▒▒▒▒▒▒██
Super Mario jumping on your terminal!`,
  };

  // Programming commands
  const programmingCommands = {
    python: (args) => 'Python interpreter started...',
    node: (args) => 'Node.js interpreter started...',
    npm: (args) => 'npm package manager command received',
    git: (args) => 'Git command would execute here',
  };

  // Network commands
  const networkCommands = {
    ping: (args) => {
      if (args.length === 0) return 'ping: usage error: Destination address required';
      const host = args[0];
      return `PING ${host} (127.0.0.1): 56 data bytes
64 bytes from 127.0.0.1: icmp_seq=0 ttl=64 time=0.080 ms
64 bytes from 127.0.0.1: icmp_seq=1 ttl=64 time=0.075 ms
64 bytes from 127.0.0.1: icmp_seq=2 ttl=64 time=0.079 ms

--- ${host} ping statistics ---
3 packets transmitted, 3 packets received, 0.0% packet loss
round-trip min/avg/max/stddev = 0.075/0.078/0.080/0.002 ms`;
    },
    
    ifconfig: () => `lo0: flags=8049<UP,LOOPBACK,RUNNING,MULTICAST> mtu 16384
    inet 127.0.0.1 netmask 0xff000000 
    inet6 ::1 prefixlen 128 
    inet6 fe80::1%lo0 prefixlen 64 scopeid 0x1 
en0: flags=8863<UP,BROADCAST,SMART,RUNNING,SIMPLEX,MULTICAST> mtu 1500
    inet 192.168.1.100 netmask 0xffffff00 broadcast 192.168.1.255`,
    
    ssh: (args) => 'ssh: Connection to host closed.',
    
    curl: (args) => {
      if (args.length === 0) return 'curl: try \'curl --help\' for more information';
      return 'HTTP request would be sent to the specified URL';
    },
  };

  // System commands
  const systemCommands = {
    ps: () => `  PID TTY           TIME CMD
    1 ??         0:06.43 /sbin/launchd
   51 ??         0:01.58 /usr/sbin/syslogd
  325 ??         0:00.54 /usr/libexec/UserEventAgent
  421 ttys000    0:00.07 -zsh`,
    
    top: () => 'System monitoring tool would display here',
    
    df: () => `Filesystem    512-blocks      Used Available Capacity  iused   ifree %iused  Mounted on
/dev/disk1s1   489825072 438995480  44286568    91% 3650029 221432840    2%   /
devfs                407       407         0   100%     706        0  100%   /dev
/dev/disk1s4   489825072    655360  44286568     2%       3 221432840    0%   /private/var/vm`,
    
    du: (args) => '8       total',
  };

  // Multimedia commands
  const multimediaCommands = {
    play: (args) => 'Playing would occur here',
    
    record: (args) => 'Recording would start',
    
    image: (args) => 'Image viewer would display',
    
    camera: () => 'Camera app would open',
  };

  // Easter egg commands
  const easterEggCommands = {
    potato: () => '🥔 Ah, the humble potato. Versatile and delicious.',
    
    coffee: () => `
      ( (
       ) )
    .______.
    |      |
    |      |
    |      |
    |______|
    
Here's your coffee! ☕`,
    
    beer: () => `
      .~~~~.
      i====i
      |====|
      |====|
      |====|
      |====|
      '-..-'
    
Cheers! 🍺`,
    
    pizza: () => `
    // \\\\
   |--------|
   '--------'
    
Here's your pizza! 🍕`,
    
    unicorn: () => `
              /
         ,.. /
       ,'   ';
  ___,'     ;
,'    \\     ;
|      \\    ;
|       \\   ;   
\\        \\  /
 \\        \\/
  \\       /
   '.    /
     \`-,/

Magical unicorn appears! 🦄`,
    
    donut: () => `
    .-"'"-.
  .'       '.
 /           \\
|             |
|             |
 \\           /
  '.       .'
    '-...-'
    
Enjoy your donut! 🍩`,
  };

  // AI commands
  const aiCommands = {
    chat: (args) => 'AI chat would be initiated',
    
    analyze: (args) => 'AI would analyze your input',
    
    generate: (args) => 'AI would generate content based on your input',
  };

  // Generate many more utility commands
  const utilityCommands = {};
  
  // Create 150 additional "fake" commands that return a message
  const commandPrefixes = ['x', 'super', 'hyper', 'mega', 'ultra', 'extreme', 'nano', 'micro', 'cyber', 'virtual', 'quantum'];
  const commandSuffixes = ['tool', 'cmd', 'util', 'program', 'app', 'script', 'proc', 'runner', 'manager', 'helper'];
  const commandTypes = ['system', 'network', 'device', 'file', 'process', 'media', 'game', 'app', 'utility', 'service'];
  
  for (let i = 0; i < 150; i++) {
    const prefix = commandPrefixes[Math.floor(Math.random() * commandPrefixes.length)];
    const suffix = commandSuffixes[Math.floor(Math.random() * commandSuffixes.length)];
    const type = commandTypes[Math.floor(Math.random() * commandTypes.length)];
    const name = `${prefix}${type}${suffix}`;
    
    utilityCommands[name] = () => `${name}: simulated ${type} command executed successfully`;
  }

  // Combine all command categories
  const allCommands = {
    ...standardCommands,
    ...funCommands,
    ...gameCommands,
    ...programmingCommands,
    ...networkCommands,
    ...systemCommands,
    ...multimediaCommands,
    ...easterEggCommands,
    ...aiCommands,
    ...utilityCommands
  };

  // Help descriptions for commands
  const commandHelp = {
    ls: "list directory contents",
    cd: "change the working directory",
    pwd: "print name of current/working directory",
    mkdir: "make directories",
    touch: "change file timestamps or create empty files",
    cat: "concatenate files and print on the standard output",
    rm: "remove files or directories",
    echo: "display a line of text",
    clear: "clear the terminal screen",
    help: "display information about built-in commands",
    man: "an interface to the system reference manuals",
    whoami: "print effective userid",
    date: "print or set the system date and time",
    exit: "exit the shell",
    fortune: "display a random fortune",
    cowsay: "generate an ASCII picture of a cow with a message",
    figlet: "display large text banners",
    cmatrix: "display The Matrix in the terminal",
    sl: "display a running steam locomotive",
    asciiquarium: "enjoy a marine desktop aquarium",
    nyancat: "display the nyan cat animation",
    tetris: "play Tetris in the terminal",
    snake: "play Snake in the terminal",
    weather: "get a weather forecast",
    dice: "roll dice with specified sides",
    joke: "get a random joke",
    quote: "get a random inspirational quote",
    funhelp: "display information about fun commands",
  };

  // Command syntax
  const commandSynopsis = {
    ls: "ls [OPTION]... [FILE]...",
    cd: "cd [DIRECTORY]",
    pwd: "pwd",
    mkdir: "mkdir [OPTION]... DIRECTORY...",
    touch: "touch [OPTION]... FILE...",
    cat: "cat [OPTION]... [FILE]...",
    rm: "rm [OPTION]... FILE...",
    echo: "echo [STRING]...",
  };

  // Command descriptions
  const commandDescription = {
    ls: "List information about the FILEs (the current directory by default).\nSort entries alphabetically if none of -cftuSUX is specified.",
    cd: "Change the shell working directory.\n\nChange the current directory to DIR. The default DIR is the value of the HOME shell variable.",
    pwd: "Print the full filename of the current working directory.",
    mkdir: "Create the DIRECTORY(ies), if they do not already exist.",
    touch: "Update the access and modification times of each FILE to the current time.\n\nA FILE argument that does not exist is created empty.",
    cat: "Concatenate FILE(s) to standard output.",
    rm: "Remove (unlink) the FILE(s).\n\n-r, -R, --recursive   remove directories and their contents recursively\n-f, --force           ignore nonexistent files, never prompt",
    echo: "Echo the STRING(s) to standard output.",
  };

  // Return all commands and helper objects
  return {
    commandList: allCommands,
    commandHelp,
    commandSynopsis,
    commandDescription
  };
};

export default createCommandList; 