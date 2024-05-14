const font = 'Doom';

figlet.defaults({ fontPath: 'https://unpkg.com/figlet/fonts/'});
figlet.preloadFonts([font], ready);

const formatter = new Intl.ListFormat('en', 
{
  style: 'long',
  type: 'conjunction',
});

const directories = 
{
    Education: [
        '',
        '<white>Education</white>',

        '* <a href="https://en.wikipedia.org/wiki/Northside_Health_Careers_High_School">Health Careers High School</a> <yellow>Biomedical Engineering</yellow> 2016-2020',
        '* <a href="https://en.wikipedia.org/wiki/University_of_Texas_at_San_Antonio">The University of Texas at San Antonio</a> <yellow>"Computer Science"</yellow> 2020-2023',
        ''
    ],
    Projects: [
        '',
        '<white>Projects</white>',
        [
            ['The Tree, The Pufferfish, and The Boulder?!?',
             'https://devpost.com/software/the-tree-the-pufferfish-and-the-boulder',
             '2D Unity Game created for a hack-a-thon'
            ],
            ['Large Scale Data Management Software',
             'https://github.com/BurgahJasper/LSDManagement',
             'Software created to webscrape fake political information and present it in a legible way'
            ],
            ['American Deer Simulator (Private Repo, Whoops)',
             'https://github.com/BurgahJasper/AmericanDeerSimulator',
             '3D Godot Game created to represent the life of a deer in America'
            ],
        ].map(([name, url, description = '']) => {
            return `* <a href="${url}">${name}</a> &mdash; <white>${description}</white>`;
        }),
        ''
    ].flat(),
    Skills: [
        '',
        '<white>Languages</white>',
        [
            'JavaScript',
            'TypeScript',
            'Python',
            'Java',
            'C/C++',
            'SQL',
            'PHP',
            'Bash'
        ].map(lang => `* <yellow>${lang}</yellow>`),
        '',
        '<white>Libraries</white>',
        [
            'React.js',
            'Redux',
            'Kaboom.js',
        ].map(lib => `* <green>${lib}</green>`),
        '',
        '<white>Tools</white>',
        [
            'Docker',
            'git',
            'AWS',
            'Windows',
            'Godot',
            'MacOS',
            'GNU/Linux'
        ].map(lib => `* <blue>${lib}</blue>`),
        ''
    ].flat()
};


const dirs = Object.keys(directories);

const root = '~';
let cwd = root;

const user = 'guest';
const server = 'jaspersterminal.com';

function prompt() 
{
    return `<green>${user}@${server}</green>:<blue>${cwd}</blue>$ `;
}

function print_dirs() 
{
    term.echo(dirs.map(dir => 
    {
        return `<blue class="directory">${dir}</blue>`;
    }).join('\n'));
}

const commands = 
{
    help() 
    {
        term.echo(`List of available commands: ${help}`);
    },
    ls(dir = null) 
    {
        if (dir) 
        {
            if (dir.startsWith('~/')) 
            {
                const path = dir.substring(2);
                const dirs = path.split('/');
                if (dirs.length > 1) 
                {
                    this.error('Invalid directory');
                } 
                else 
                {
                    const dir = dirs[0];
                    this.echo(directories[dir].join('\n'));
                }
            } 
            else if (cwd === root) 
            {
                if (dir in directories) {
                    this.echo(directories[dir].join('\n'));
                } else {
                    this.error('Invalid directory');
                }
            } 
            else if (dir === '..') 
            {
                print_dirs();
            } else 
            {
                this.error('Invalid directory');
            }
        } 
        else if (cwd === root) 
        {
           print_dirs();
        } 
        else 
        {
            const dir = cwd.substring(2);
            this.echo(directories[dir].join('\n'));
        }
    },
    async joke() 
    {
        const res = await fetch('https://v2.jokeapi.dev/joke/Any?blacklistFlags=nsfw,religious,political,racist,sexist,explicit');
        const data = await res.json();
        (async () => {
            if (data.type == 'twopart') 
            {
                const prompt = this.get_prompt();
                this.set_prompt('');
                await this.echo(`Q: ${data.setup}`, 
                {
                    delay: 50,
                    typing: true
                });
                await this.echo(`A: ${data.delivery}`, 
                {
                    delay: 50,
                    typing: true
                });
                this.set_prompt(prompt);
            } 
            else if (data.type === 'single') 
            {
                await this.echo(data.joke, 
                {
                    delay: 50,
                    typing: true
                });
            }
        })();
    },
    cd(dir = null) 
    {
        if (dir === null || (dir === '..' && cwd !== root)) {
            cwd = root;
        } else if (dir.startsWith('~/') && dirs.includes(dir.substring(2))) {
            cwd = dir;
        } else if (dirs.includes(dir)) {
            cwd = root + '/' + dir;
        } else {
            this.error('Wrong directory');
        }
    },
    credits() 
    {
        return [
            '',
            '<white>Libraries Used:</white>',
            '* <a href="https://terminal.jcubic.pl">jQuery Terminal</a>',
            '* <a href="https://github.com/patorjk/figlet.js/">Figlet.js</a>',
            '* <a href="https://github.com/jcubic/isomorphic-lolcat">Isomorphic Lolcat</a>',
            '* <a href="https://jokeapi.dev/">Joke API</a>',
            '* <a href="https://www.freecodecamp.org/news/how-to-create-interactive-terminal-based-portfolio/">Jakub T. Jankiewicz Freecodecamp Terminal Portfolio Tutorial</a>',
            ''
        ].join('\n');
    },
    echo(...args) 
    {
        if (args.length > 0) 
        {
            term.echo(args.join(' '));
        }
    }
};

const command_list = ['clear'].concat(Object.keys(commands));
const formatted_list = command_list.map(cmd => `<white class="command">${cmd}</white>`);
const help = formatter.format(formatted_list);

const re = new RegExp(`^\s*(${command_list.join('|')})(\s?.*)`);

$.terminal.new_formatter([re, function(_, command, args) {
    return `<white class="command">${command}</white><aquamarine>${args}</aquamarine>`;
}]);

$.terminal.xml_formatter.tags.blue = (attrs) => {
    return `[[;#55F;;${attrs.class}]`;
};
$.terminal.xml_formatter.tags.green = (attrs) => {
    return `[[;#44D544;]`;
};

const term = $('body').terminal(commands, 
    {
    greetings: false,
    checkArity: false,
    completion(string) 
    {
        const { name, rest } = $.terminal.parse_command(this.get_command());
        if (['cd', 'ls'].includes(name)) 
        {
            if (rest.startsWith('~/')) 
            {
                return dirs.map(dir => `~/${dir}`);
            }
            if (cwd === root) 
            {
                return dirs;
            }
        }
        return Object.keys(commands);
    },
    prompt
});

term.pause();

term.on('click', '.command', function() 
{
   const command = $(this).text();
   term.exec(command, { typing: true, delay: 50 });
});

term.on('click', '.directory', function() 
{
    const dir = $(this).text();
    term.exec(`cd ~/${dir}`, { typing: true, delay: 50 });
});

function ready() 
{
   term.echo(() => (render('Jasper\'s Terminal')))
       .echo('<white>Welcome to my Terminal Portfolio! Start by typing "help".</white>\n').resume();
}

function render(text) 
{
    const cols = term.cols();
    return trim(figlet.textSync(text, 
    {
        font: font,
        width: cols,
        whitespaceBreak: true
    }));
}

function trim(str) 
{
    return str.replace(/[\n\s]+$/, '');
}

function hex(color) 
{
    return '#' + [color.red, color.green, color.blue].map(n => {
        return n.toString(16).padStart(2, '0');
    }).join('');
}