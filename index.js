/* global __dirname */
let BadGui

try {
    BadGui = require('../badGui')
} catch (e) {
    try {
        BadGui = require('../badGui-master')
    } catch (e) {
        console.log(`[FPS-UTILS] - badGUI not installed, GUI functionality disabled, please see the readme for more information`)
    }
}

module.exports = function FpsUtils2(mod) {
    const npcData = require(`./npcData.json`)
    const skills = require(`./skillString.json`)
	const fps_UI = 200001;
    let data = [],
        gui,
        NASux,
        useGui = false,
        red = `#fcf9ea`,
        green = `#204ed3`,
        myId,
        alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split(''),
        partyMembers = [],
        spawnedPlayers = {},
        hiddenUsers = {},
        hiddenNpcs = {};
    try {
        gui = new BadGui(mod);
        useGui = true
    } catch (e) {
        useGui = false
        console.log(`[FPS-UTILS] - &#x672A;&#x5B89;&#x88DD;badGUI&#xFF0C;&#x7981;&#x7528;&#x4E86;GUI&#x529F;&#x80FD;&#xFF0C;&#x8ACB;&#x53C3;&#x95B1;&#x81EA;&#x8FF0;&#x6587;&#x4EF6;&#x4EE5;&#x7372;&#x53D6;&#x66F4;&#x591A;&#x4FE1;&#x606F;`)
    }
    // ~~~ * GUI handling stuff I should put somewhere else * ~~~

    function listSkills(value) {
        let keys = []
        let data = []
        let skillIds = []
        data.push(
            { text: `<font color="#4dd0e1" size="+22">&#x9078;&#x64C7;&#x4F60;&#x60F3;&#x8981;&#x96B1;&#x85CF;&#x7684;&#x6280;&#x80FD;&#x52D5;&#x4F5C;</font><br>` },
            { text: `&#x9EDE;&#x64CA;&#x8FD4;&#x56DE;<br><font size="+17">`, command: `fps gui skills` },
            { text: `<font color="${mod.settings.classes[classId(value)].blockingSkills ? green : red}">[[&#x6240;&#x6709;&#x6280;&#x80FD;]]</font>`, command: `fps skills class ${value};fps gui class ${value}` }

        )
        for (let key in skills[value]) {
            keys.push(key);
        }
        skillIds.push(Object.values(skills[value]))
        for (var i = 0; i < keys.length; i++) {
            data.push({ command: `fps skill class ${value} ${skillIds[0][i]};fps gui class ${value}`, text: `<font color="${mod.settings.classes[classId(value)].blockedSkills.includes(skillIds[0][i].toString()) ? green : red}"> [${keys[i]}]</font><br>` })
            //this is by far the worse and best thing I have ever seen
        }
        return data
    }

    function search(nameKey, array, arg) {
        for (let i = 0; i < array.length; i++) {
            if (array[i].Name.startsWith(nameKey) && arg == `starts`) {
                data.push({
                    command: `fps npc hide ${array[i].HuntingZoneId} ${array[i].TemplateId};fps gui npc ${nameKey}`, text: `<font color="${mod.settings.hiddenNpcs.some(() => {
                        return mod.settings.hiddenNpcs.some((arrVal) => {
                            if (array[i].HuntingZoneId == arrVal.zone && array[i].TemplateId == arrVal.templateId) {
                                return true
                            } else
                                return false
                        })
                    }) ? green : red}"> [${array[i].Name}]</font><br>`
                })
            }
            if (array[i].Name.includes(nameKey) && arg == `search`) {
                data.push({ command: `fps npc hide ${array[i].HuntingZoneId} ${array[i].TemplateId};fps gui npc ${nameKey}`, text: ` [${array[i].Name}]<br>` })
            }
            if (!isNaN(arg)) {//ho boy wow what are you dooooing
                if (array[i].nameKey == arg) {
                    return true
                }
            }
        }
        gui.parse(data, `<font color="#dcc856"> FPS-UTILS &#x8A2D;&#x7F6E; - NPCs`)
        data = []
    }

    function classId(name) { //this should really be reused for things other than GUI but can't be without adding their bloat here or changing the structure of the commands
        for (let ass of Object.keys(mod.settings.classes)) {
            if (mod.settings.classes[ass].name == name) {
                return ass
            }
        }
    }

	
    function handleGui(page, arg) {
        switch (page) {
            case 'searchnpc':
            case 'npcsearch':
                data = []
                data.push(
                    { text: `<font color="#4dd0e1" size="+22">Search results for "${arg}":<br>` },
                    { text: `<font color="#dcc856">&#x9EDE;&#x64CA;&#x6B64;&#x8655;&#x8FD4;&#x56DE;&#x4E3B;&#x9078;&#x55AE;<br><font size="+18">`, command: `fps gui` }
                )
                search(arg, npcData, `search`)
                break
            case 'npc':
                data = []
                data.push(
                    { text: `<font color="#4dd0e1" size="+22">Search results for "${arg}":<br>` },
                    { text: `<font color="#dcc856">&#x9EDE;&#x64CA;&#x6B64;&#x8655;&#x8FD4;&#x56DE;&#x4E3B;&#x9078;&#x55AE;<br><font size="+18">`, command: `fps gui` }
                )
                search(arg, npcData, `starts`)
                break
            case 'npclist':
                data = []
                data.push(
                    { text: `<font color="#4dd0e1" size="+22">Select an NPC ID to remove it from the blacklist:<br><font size="+18">` },
                    { text: `<font color="#dcc856">&#x9EDE;&#x64CA;&#x6B64;&#x8655;&#x8FD4;&#x56DE;&#x4E3B;&#x9078;&#x55AE;<br>`, command: `fps gui` },
                    { text: `Click here to return to the main NPC page<br><font size="+18">`, command: `fps gui npcMain` },
                )
                for (let i = 0; i < mod.settings.hiddenNpcs.length; i++) {
                    data.push({ text: `${mod.settings.hiddenNpcs[i].zone}, ${mod.settings.hiddenNpcs[i].templateId}<br>`, command: `fps npc hide ${mod.settings.hiddenNpcs[i].zone} ${mod.settings.hiddenNpcs[i].templateId};fps gui npclist` })
                }
                gui.parse(data, `<font color="#dcc856"> FPS-UTILS &#x8A2D;&#x7F6E; - NPCs`)
                break
            case 'npcMain':
                data = []
                data.push(
                    { text: `<font color="#dcc856" size="+22">&#x9EDE;&#x64CA;&#x6B64;&#x8655;&#x8FD4;&#x56DE;&#x4E3B;&#x9078;&#x55AE;<br><font size="+18">`, command: `fps gui` },
                    { text: `Click here to list currently hidden NPCs by Zone/TemplateId<br>`, command: `fps gui npclist` },
                    { text: `<font color="${mod.settings.blacklistNpcs ? green : red}">[Toggle hiding of blacklisted NPCs]</font><br></br>`, command: `fps npc;fps gui npcMain` },
                    { text: `<font color="#4dd0e1" size="+22">Select a letter to view all NPCs starting with that letter:<br>` },
                    { text: `<font color="#dcc856" size="+16">You can also use the command "fps gui searchnpc [name]" to search for a specific NPC by name</font><br><br>` },

                )
                for (var i = 0; i < alphabet.length; i++) {
                    data.push({ text: `${alphabet[i]} `, command: `fps gui npc ${alphabet[i]}` })
                }
                gui.parse(data, `<font color="#dcc856"> FPS-UTILS &#x8A2D;&#x7F6E; - NPCs`)
                break
            case "hide":
                data = []
                data.push(
                    { text: `<font color="#4dd0e1" size="+22">&#x9078;&#x64C7;&#x8981;&#x96B1;&#x85CF;&#x7684;&#x73A9;&#x5BB6;ID&#x4E26;&#x5C07;&#x5176;&#x6DFB;&#x52A0;&#x5230;&#x9ED1;&#x540D;&#x55AE;<br>` },
                    { text: `<font color="#4dd0e1" size="+18">&#x60A8;&#x9084;&#x53EF;&#x4EE5;&#x4F7F;&#x7528;&#x547D;&#x4EE4;&#x201C;fps hide <&#x73A9;&#x5BB6;ID>&#x201D;&#x96B1;&#x85CF;&#x672A;&#x51FA;&#x73FE;&#x5728;&#x756B;&#x9762;&#x7684;&#x4EBA;<br><br>` },
                    { text: `<font color="#dcc856">&#x9EDE;&#x64CA;&#x6B64;&#x8655;&#x8FD4;&#x56DE;&#x4E3B;&#x9078;&#x55AE;<br><font size="+17">`, command: `fps gui` }
                )
                for (let i in spawnedPlayers) {
                    data.push({ text: `<font color="${mod.settings.blacklistedNames.includes(spawnedPlayers[i].name) ? green : red}">${spawnedPlayers[i].name}</font><br>`, command: `fps hide ${spawnedPlayers[i].name};fps gui hide` })
                }
                gui.parse(data, `<font color="#dcc856"> FPS-UTILS &#x9078;&#x9805; - &#x73A9;&#x5BB6;`)
                break
            case "show":
                data = []
                data.push(
                    { text: `<font color="#4dd0e1" size="+22">&#x9078;&#x64C7;&#x8981;&#x53D6;&#x6D88;&#x96B1;&#x85CF;&#x7684;&#x73A9;&#x5BB6;&#x4E26;&#x5C07;&#x5176;&#x5F9E;&#x9ED1;&#x540D;&#x55AE;&#x4E2D;&#x522A;&#x9664;<br>` },
                    { text: `<font color="#dcc856">&#x9EDE;&#x64CA;&#x6B64;&#x8655;&#x8FD4;&#x56DE;&#x4E3B;&#x9078;&#x55AE;`, command: `fps gui` }
                )
                mod.settings.blacklistedNames.forEach((mem) => { data.push({ text: `${mem}<br>`, command: `fps show ${mem};fps gui show` }) }) //yes this is not the best
                gui.parse(data, `<font color="#dcc856"> FPS-UTILS &#x8A2D;&#x7F6E; - &#x96B1;&#x85CF;&#x73A9;&#x5BB6;`)
                break
            case "skills":
                gui.parse([
                    { text: `<font color="#4dd0e1" size="+22">&#x96B1;&#x85CF;&#x8077;&#x696D;&#x6280;&#x80FD;:<br><br>` },
                    { text: `&#x9EDE;&#x64CA;&#x8FD4;&#x56DE;<br>`, command: `fps gui` },
                    { text: `<font color="${mod.settings.blacklistSkills ? green : red}">[toggle skill blacklisting]</font><br>`, command: `fps skill black;fps gui skills` },
                    { text: `&#x96B1;&#x85CF;&#x7279;&#x5B9A;&#x6280;&#x80FD;&#xFF08;&#x9EDE;&#x9078;&#x8077;&#x696D;&#x985E;&#x5225;&#x9032;&#x5165;&#x6280;&#x80FD;&#x5217;&#x8868;&#xFF09;:<font size="+17"><br>` },
                    { text: `<font color="#fcf9ea">&#x528D;&#x9B25;<br>`, command: `fps gui class warrior` },
                    { text: `&#x69CD;&#x9A0E;<br>`, command: `fps gui class lancer` },
                    { text: `&#x5C60;&#x6BBA;&#x8005;<br>`, command: `fps gui class slayer` },
                    { text: `&#x72C2;&#x6230;&#x58EB;<br>`, command: `fps gui class berserker` },
                    { text: `&#x9B54;&#x5C0E;&#x58EB;<br>`, command: `fps gui class sorcerer` },
                    { text: `&#x5F13;&#x7BAD;&#x624B;<br>`, command: `fps gui class archer` },
                    { text: `&#x796D;&#x53F8;<br>`, command: `fps gui class priest` },
                    { text: `&#x5143;&#x7D20;&#x4F7F;<br>`, command: `fps gui class mystic` },
                    { text: `&#x98DB;&#x528D;&#x58EB;<br>`, command: `fps gui class reaper` },
                    { text: `&#x9B54;&#x5DE5;&#x5E2B;<br>`, command: `fps gui class gunner` },
                    { text: `&#x9B54;&#x62F3;&#x5E2B;<br>`, command: `fps gui class brawler` },
                    { text: `&#x5FCD;&#x8005;<br>`, command: `fps gui class ninja` },
                    { text: `&#x6708;&#x5149;&#x6B66;&#x58EB;<br>`, command: `fps gui class valkyrie` }
                ], `<font color="#dcc856"> FPS-UTILS &#x8A2D;&#x7F6E; - &#x6280;&#x80FD;`)
                break
            case "class":
                gui.parse(listSkills(arg), `<font color="#dcc856"> FPS-UTILS &#x8A2D;&#x7F6E; - &#x6280;&#x80FD;&#x5217;&#x8868; ${arg}`)
                break
            case "role":
                gui.parse([
                    { text: `<font color="#4dd0e1" size="+22">&#x96B1;&#x85CF;&#x8077;&#x696D;/&#x89D2;&#x8272;:<br><br>` },
                    { text: `<font color="#dcc856">&#x9EDE;&#x64CA;&#x6B64;&#x8655;&#x8FD4;&#x56DE;&#x4E3B;&#x9078;&#x55AE;<br><font size="+18">`, command: `fps gui` },
                    { text: `<font color="${mod.settings.hiddenClasses.includes('warrior') ? green : red}">&#x528D;&#x9B25;&#x58EB;</font><br>`, command: `fps ${mod.settings.hiddenClasses.includes('warrior') ? `show` : `hide`} warrior;fps gui role` },
                    { text: `<font color="${mod.settings.hiddenClasses.includes('lancer') ? green : red}">&#x69CD;&#x9A0E;&#x58EB;</font><br>`, command: `fps ${mod.settings.hiddenClasses.includes('lancer') ? `show` : `hide`} lancer;fps gui role` },
                    { text: `<font color="${mod.settings.hiddenClasses.includes('slayer') ? green : red}">&#x5C60;&#x6BBA;&#x8005;</font><br>`, command: `fps ${mod.settings.hiddenClasses.includes('slayer') ? `show` : `hide`} slayer;fps gui role` },
                    { text: `<font color="${mod.settings.hiddenClasses.includes('berserker') ? green : red}">&#x72C2;&#x6230;&#x58EB;</font><br>`, command: `fps ${mod.settings.hiddenClasses.includes('berserker') ? `show` : `hide`} berserker;fps gui role` },
                    { text: `<font color="${mod.settings.hiddenClasses.includes('sorcerer') ? green : red}">&#x9B54;&#x5C0E;&#x58EB;</font><br>`, command: `fps ${mod.settings.hiddenClasses.includes('sorcerer') ? `show` : `hide`} sorcerer;fps gui role` },
                    { text: `<font color="${mod.settings.hiddenClasses.includes('archer') ? green : red}">&#x5F13;&#x7BAD;&#x624B;</font><br>`, command: `fps ${mod.settings.hiddenClasses.includes('archer') ? `show` : `hide`} archer;fps gui role` },
                    { text: `<font color="${mod.settings.hiddenClasses.includes('priest') ? green : red}">&#x796D;&#x53F8;</font><br>`, command: `fps ${mod.settings.hiddenClasses.includes('priest') ? `show` : `hide`} priest;fps gui role` },
                    { text: `<font color="${mod.settings.hiddenClasses.includes('mystic') ? green : red}">&#x5143;&#x7D20;&#x4F7F;</font><br>`, command: `fps ${mod.settings.hiddenClasses.includes('mystic') ? `show` : `hide`} mystic;fps gui role` },
                    { text: `<font color="${mod.settings.hiddenClasses.includes('reaper') ? green : red}">&#x98DB;&#x528D;&#x58EB;</font><br>`, command: `fps ${mod.settings.hiddenClasses.includes('reaper') ? `show` : `hide`} reaper;fps gui role` },
                    { text: `<font color="${mod.settings.hiddenClasses.includes('gunner') ? green : red}">&#x9B54;&#x5DE5;&#x5E2B;</font><br>`, command: `fps ${mod.settings.hiddenClasses.includes('gunner') ? `show` : `hide`} gunner;fps gui role` },
                    { text: `<font color="${mod.settings.hiddenClasses.includes('brawler') ? green : red}">&#x9B54;&#x62F3;&#x5E2B;</font><br>`, command: `fps ${mod.settings.hiddenClasses.includes('brawler') ? `show` : `hide`} brawler;fps gui role` },
                    { text: `<font color="${mod.settings.hiddenClasses.includes('ninja') ? green : red}">&#x5FCD;&#x8005;</font><br><br>`, command: `fps ${mod.settings.hiddenClasses.includes('ninja') ? `show` : `hide`} ninja;fps gui role` },
                    { text: `<font color="${mod.settings.hiddenRoles.includes('dps') ? green : red}">DPS</font><br>`, command: `fps ${mod.settings.hiddenRoles.includes('dps') ? `show` : `hide`} dps;fps gui role` },
                    { text: `<font color="${mod.settings.hiddenRoles.includes('healer') ? green : red}">Healers</font><br>`, command: `fps ${mod.settings.hiddenRoles.includes('healer') ? `show` : `hide`} healer;fps gui role` },
                    { text: `<font color="${mod.settings.hiddenRoles.includes('tank') ? green : red}">Tanks</font><br>`, command: `fps ${mod.settings.hiddenRoles.includes('tank') ? `show` : `hide`} tank;fps gui role` },
                    { text: `<font color="${mod.settings.hiddenRoles.includes('ranged') ? green : red}">Ranged</font><br>`, command: `fps ${mod.settings.hiddenRoles.includes('ranged') ? `show` : `hide`} ranged;fps gui role` },
                ], `<font color="#dcc856"> FPS-UTILS &#x8A2D;&#x7F6E; - &#x96B1;&#x85CF;&#x89D2;&#x8272;`)
                break
            case "abn":
                gui.parse([
                    { text: `<font color="#4dd0e1" size="+22">&#x7570;&#x5E38;&#x72C0;&#x614B;/&#x6548;&#x679C;&#x8A2D;&#x7F6E;&#xFF1A;:<br><br>` },
                    { text: `&#x9EDE;&#x64CA;&#x6B64;&#x8655;&#x8FD4;&#x56DE;&#x4E3B;&#x9078;&#x55AE;<br><font size="+18">`, command: `fps gui` },
                    { text: `<font color="${mod.settings.blacklistAbnormies ? green : red}"> [&#x96B1;&#x85CF;&#x6240;&#x6709;&#x7570;&#x5E38;/&#x6548;&#x679C;] </font><br>`, command: `fps proj all;fps gui abn` },
                    { text: `<font color="${mod.settings.hideAllAbnormies ? green : red}"> [&#x96B1;&#x85CF;&#x540D;&#x55AE;&#x5167;&#x6307;&#x5B9A;&#x7684;&#x7570;&#x5E38;/&#x6548;&#x679C; (&#x66AB;&#x6642;&#x7121;&#x6B64;&#x529F;&#x80FD;!)] </font><br>`, command: `fps proj blacklist;fps gui abn` },
                ], `<font color="#dcc856"> FPS-UTILS &#x8A2D;&#x7F6E; - &#x7570;&#x5E38;&#x72C0;&#x614B;`)
                break
            case "proj":
                gui.parse([
                    { text: `<font color="#4dd0e1" size="+22">&#x6295;&#x5C04;&#x6280;&#x80FD;&#x8A2D;&#x5B9A;:<br><br>` },
                    { text: `<font color="#dcc856">&#x9EDE;&#x64CA;&#x6B64;&#x8655;&#x8FD4;&#x56DE;&#x4E3B;&#x9078;&#x55AE;<br><font size="+18">`, command: `fps gui` },
                    { text: `<font color="${mod.settings.hideProjectiles ? green : red}"> [&#x96B1;&#x85CF;&#x6240;&#x6709;&#x6295;&#x5C04;&#x6280;&#x80FD;] </font><br>`, command: `fps proj all;fps gui proj` },
                    { text: `<font color="${mod.settings.blacklistProjectiles ? green : red}"> [&#x96B1;&#x85CF;&#x540D;&#x55AE;&#x5167;&#x6307;&#x5B9A;&#x7684;&#x6295;&#x5C04;&#x6280;&#x80FD; (&#x66AB;&#x6642;&#x7121;&#x6B64;&#x529F;&#x80FD;!)] </font><br>`, command: `fps proj blacklist;fps gui proj` },
                ], `<font color="#dcc856"> FPS-UTILS&#x9078;&#x9805; - &#x6295;&#x5C04;&#x6280;&#x80FD;`)
                break
            default:
                gui.parse([
                    { text: `{1}<font color="#fcf9ea" size="+15">[&#x7AF6;&#x6280;&#x5834;&#x7BB1;-&#x9ED1;&#x5564;&#x9152;] </font>{/1}`, command: `rootbeer`},//rootbeer
					{ text: `{2}<font color="#fcf9ea" size="+15">[&#x6B50;&#x812B;&#x5361;&#x65AF;&#x7279;] </font>{/2}`, command: `autocast` },//letmelock	
					{ text: `{3}<font color="#fcf9ea" size="+15">[LetMeFxck] </font>{/3}`, command: `slay` },//letmepot
					{ text: `{4}<font color="#fcf9ea" size="+15">[&#x7BB1;&#x5B50;] </font>{/4}`, command: `box` },//box ??					
					{ text: `{5}<font color="#fcf9ea" size="+15">[&#x6B50;&#x62C9;&#x62C9;] </font>{/5}<br>`, command: `oll` },//75water
					{ text: `{6}<font color="#fcf9ea" size="+15">[null] </font>{/6}`, command: `sp on` },//sp on ??
					{ text: `<font color="#dc55c0" size="+15">[null] </font>`, command: `sp off` },//sp off ??					
					{ text: `{7}<font color="#dc55c0" size="+15">[IFF&#x7CFB;&#x7D71;] </font>{/7}`, command: `partymarkers` },//partymarkers ?????
					{ text: `{8}<font color="#fcf9ea" size="+15">[&#x5DF4;&#x6EF4;&#x5E03;&#x7F85;&#x514B;] </font>{/8}`, command: `bb` },//bb ?????
					{ text: `{9}<font color="#fcf9ea" size="+15">[&#x5FEB;&#x901F;&#x52A0;&#x8F09;] </font>{/9}`, command: `ql` },//ql ????
					{ text: `{10}<font color="#fcf9ea" size="+15">[&#x4F60;&#x4ED6;&#x5ABD;&#x5FEB;] </font>{/10}<br>`, command: `fly` },//Lotus ???
					{ text: `{11}<font color="#fcf9ea" size="+15">[&#x8996;&#x8DDD;&#xFF1A;500] </font>{/11}`, command: `camera 550` },
					{ text: `<font color="#fcf9ea" size="+15">[&#x8996;&#x8DDD;&#xFF1A;700] </font>`, command: `camera 700` },
					{ text: `<font color="#fcf9ea" size="+15">[&#x8996;&#x8DDD;&#xFF1A;800] </font>`, command: `camera 800` },
					{ text: `<font color="#fcf9ea" size="+15">[&#x8996;&#x8DDD;&#xFF1A;900] </font>`, command: `camera 900` },
					{ text: `<font color="#fcf9ea" size="+15">[&#x8996;&#x8DDD;&#xFF1A;1100] </font><br>`, command: `camera 1100` },
					{ text: `{12}<font color="#fcf9ea" size="+15">[hp&#xFF1A;1] </font>{/12}`, command: `hp 1` },
					{ text: `<font color="#fcf9ea" size="+15">[hp&#xFF1A;10] </font>`, command: `hp 10` },
					{ text: `<font color="#fcf9ea" size="+15">[hp&#xFF1A;20] </font>`, command: `hp 20` }, 			
					{ text: `<font color="#fcf9ea" size="+15">[hp&#xFF1A;30] </font>`, command: `hp 30` },
					{ text: `<font color="#fcf9ea" size="+15">[hp&#xFF1A;40] </font><br>`, command: `hp 40` },
					{ text: `{13}<font color="#fcf9ea" size="+15">[null] </font>{/13}`, command: `loots roll` },
					{ text: `<font color="#fcf9ea" size="+15">[null] </font>`, command: `loots random` },
					{ text: `<font color="#fcf9ea" size="+15">[null] </font><br>`, command: `loots ffa` },					
					{ text: `<font color="#4dd0e1" size="+18">FPS-&#x6A21;&#x5F0F;:<br>` },//FPS-??:
                    { text: `{A}<font color="${mod.settings.mode === 0 ? green : red}"> [0- &#x7981;&#x7528;&#x6240;&#x6709;&#x6A21;&#x5F0F;] </font>{/A}`, command: `fps mode 0;fps gui` },
                    { text: `{A}<font color="${mod.settings.mode === 1 ? green : red}"> [1- &#x96B1;&#x85CF;&#x6240;&#x6709;&#x6295;&#x5C04;&#x6280;&#x80FD;&#x8207;&#x5176;&#x4ED6;&#x73A9;&#x5BB6;&#x7684;&#x547D;&#x4E2D;&#x6548;&#x679C;] </font>{/A}`, command: `fps mode 1;fps gui` },
                    { text: `{A}<font color="${mod.settings.mode === 2 ? green : red}"> [2- &#x96B1;&#x85CF;&#x6280;&#x80FD;&#x52D5;&#x4F5C;] </font>{/A}`, command: `fps mode 2;fps gui` },
                    { text: `{A}<font color="${mod.settings.mode === 3 ? green : red}"> [3- &#x96B1;&#x85CF;&#x6240;&#x6709;&#x73A9;&#x5BB6;] </font>{/A}`, command: `fps mode 3;fps gui` },
                    { text: `FPS-&#x50B7;&#x5BB3;&#x986F;&#x793A;&#x6548;&#x679C;:<br>` },
                    { text: `{A}<font color="${mod.settings.hitMe ? green : red}"> [&#x96B1;&#x85CF;&#x81EA;&#x5DF1;&#x7684;&#x547D;&#x4E2D;&#x6548;&#x679C;&#x53CA;&#x50B7;&#x5BB3;] </font>{/A}`, command: `fps hit me;fps gui` },
                    { text: `{A}<font color="${mod.settings.hitOther ? green : red}"> [&#x96B1;&#x85CF;&#x5176;&#x4ED6;&#x73A9;&#x5BB6;&#x7684;&#x653B;&#x64CA;&#x6548;&#x679C;] </font>{/A}`, command: `fps hit other;fps gui` },
                    { text: `{A}<font color="${mod.settings.hitDamage ? green : red}"> [&#x96B1;&#x85CF;&#x50B7;&#x5BB3;&#x6578;&#x5B57;] </font>{/A}`, command: `fps hit other;fps gui` },
                    { text: `<font color="${mod.settings.party ? green : red}"> [&#x96B1;&#x85CF;&#x975E;&#x7D44;&#x968A;&#x7684;&#x73A9;&#x5BB6;] </font><br>`, command: `fps party;fps gui` },
                    { text: `<font color="${mod.settings.hideAllSummons ? green : red}"> [&#x96B1;&#x85CF;&#x53EC;&#x559A;&#x7269;] </font><br>`, command: `fps summons;fps gui` },
                    { text: `<font color="${mod.settings.keepMySummons ? green : red}"> [&#x96B1;&#x85CF;&#x6211;&#x7684;&#x53EC;&#x559A;&#x7269;] </font><br>`, command: `fps summons mine;fps gui` },
                    { text: `<font color="${mod.settings.hideFireworks ? green : red}"> [&#x96B1;&#x85CF;&#x706B;&#x82B1;&#x6548;&#x679C;] </font><br>`, command: `fps fireworks;fps gui` },
                    { text: `<font color="${mod.settings.showStyle ? green : red}"> [&#x96B1;&#x85CF;&#x5176;&#x5B83;&#x73A9;&#x5BB6;&#x6642;&#x88DD;] </font><br><br>`, command: `fps style;fps gui` },
                    { text: `{1}&#x96B1;&#x85CF;&#x8077;&#x696D;/&#x89D2;&#x8272;{/1}`, command: `fps gui role` },
                    { text: `{2}&#x96B1;&#x85CF;&#x6280;&#x80FD;{/2}`, command: `fps gui skills` },
                    { text: `{3}&#x96B1;&#x85CF;&#x6307;&#x5B9A;&#x73A9;&#x5BB6;{/3}<br>`, command: `fps gui hide` },
                    { text: `{4}&#x986F;&#x793A;&#x73A9;&#x5BB6;{/4}`, command: `fps gui show` },
                    { text: `{5}&#x96B1;&#x85CF;NPC{/5}`, command: `fps gui npcMain` },
					{ text: `{6}&#x7570;&#x5E38;&#x72C0;&#x614B;/&#x6548;&#x679C;{/6}`, command: `fps gui abn` }, //Need a less bad list/sorting method                    
                    { text: `{7}&#x6295;&#x5C04;&#x6280;&#x80FD;{/7}<br>`, command: `fps gui proj` }, //Need a better list
                ], `<font color="#dcc856"> TERA &#x5C0F;&#x3105;&#x624B;`) //FPS-UTILS &#x8A2D;&#x5B9A;

        }
    }

    // ~~~ * commands * ~~~
    mod.command.add('fps', (cmd, arg, arg2, arg3) => {
        mod.saveSettings() // for some reason settings weren't saving so we have this here now I guess ­Ъци
        switch (cmd) {
			case "add":
				mod.settings.openui.push(Number(arg));
				break;
			case "remove":
				mod.settings.openui.splice(mod.settings.openui.indexOf(Number(arg)), 1);
				break;
            case "gui":
                if (useGui) {
                    handleGui(arg, arg2);
                } else {
                    message(`badGUI not installed, please see the FPS-Utils readme for more information`)
                }
                break;
            case "mode":
            case "state":
                switch (arg) {
                    case "0":
                    case "off":
                        if (mod.settings.mode === 3) {
                            showAll();
                        }
                        mod.settings.hideAllAbnormies = false
                        mod.settings.hitOther = false
                        mod.settings.mode = 0;
                        message(`All FPS improvements disabled`);
                        break
                    case "1":
                        if (mod.settings.mode === 3) {
                            showAll();
                        }
                        mod.settings.mode = 1;
                        //mod.settings.hideAllAbnormies = true;
                        mod.settings.hitOther = true;
                        message(`FPS mode set to 1, projectiles hidden and abnormalities disabled`);
                        break
                    case "2":
                        if (mod.settings.mode === 3) {
                            showAll();
                        }
                        mod.settings.mode = 2;
                        // mod.settings.hideAllAbnormies = true;
                        mod.settings.hitOther = true;
                        message(`FPS mode set to 2, all skill effects disabled`);
                        break
                    case "3":
                        hideAll();
                        mod.settings.mode = 3;
                        mod.settings.hideAllAbnormies = true;
                        mod.settings.hitOther = true;
                        message(`FPS mode set to 3, hiding all players, their effects and their hit effects.`);
                        break
                    default:
                        message(`Invalid mode ${arg}, valid modes are : 0,1,2,3`);
                }
                break
            case "hide":
                if (typeof arg === "string" && arg !== null) {
                    if (mod.settings.blacklistedNames.includes(arg)) {
                        message(`Player "${arg}" already hidden!`);
                        return;
                    } else
                        if ((mod.settings.classNames.includes(arg) && !mod.settings.hiddenClasses.includes(arg)) || (mod.settings.roleNames.includes(arg) && !mod.settings.hiddenRoles.includes(arg))) {
                            for (let i in mod.settings.classes) {
                                if ((mod.settings.classes[i].name === arg || mod.settings.classes[i].role.includes(arg)) && mod.settings.classes[i].isHidden !== true) { //loops are fun, right?
                                    mod.settings.classes[i].isHidden = true;
                                    if (mod.settings.classes[i].name === arg) {
                                        mod.settings.hiddenClasses.push(arg);
                                    }
                                    if (mod.settings.classes[i].role.includes(arg)) {
                                        mod.settings.hiddenRoles.push(arg);
                                    }
                                    let classtohide = mod.settings.classes[i].model;
                                    for (let i in spawnedPlayers) {
                                        if (getClass(spawnedPlayers[i].templateId) === classtohide) {
                                            hidePlayer(spawnedPlayers[i].name);
                                        }
                                    }
                                }
                            }
                            message(`Class/Role ${arg} hidden`);
                            return;
                        } else if (mod.settings.hiddenClasses.includes(arg) || mod.settings.hiddenRoles.includes(arg)) {
                            message(`Class/Role "${arg}" already hidden!`);
                            return;
                        }
                    // if (!spawnedPlayers[arg]) {
                    //   message(`Player ${arg} not spawned in, hiding anyway!`);
                    // } else {
                    message(`Player "${arg}" hidden!`);
                    // }
                    mod.settings.blacklistedNames.push(arg);
                    hidePlayer(arg);
                } else
                    message(`Invalid name "${arg}"`);
                break
            case "show":
                if (typeof arg === "string" && arg !== null) {
                    if (mod.settings.blacklistedNames.includes(arg)) {
                        showPlayer(arg);
                        removeName(mod.settings.blacklistedNames, arg);
                        message(`Player "${arg}" shown!`);
                        return;
                    }
                    if ((mod.settings.classNames.includes(arg) && mod.settings.hiddenClasses.includes(arg)) || (mod.settings.hiddenRoles.includes(arg) && mod.settings.roleNames.includes(arg))) {
                        for (let i in mod.settings.classes) {
                            if (mod.settings.classes[i].name === arg || mod.settings.classes[i].role.includes(arg)) {//loops are fun, right?
                                if (mod.settings.classes[i].name === arg) {
                                    removeName(mod.settings.hiddenClasses, arg);
                                }
                                if (mod.settings.classes[i].role.includes(arg)) {
                                    removeName(mod.settings.hiddenRoles, arg);
                                }
                                mod.settings.classes[i].isHidden = false;
                                let classToShow = mod.settings.classes[i].model;
                                for (let i in hiddenUsers) {
                                    if (getClass(hiddenUsers[i].templateId) === classToShow) {
                                        showPlayer(hiddenUsers[i].name);
                                    }
                                }

                            }
                        }
                        message(`Class "${arg}" redisplayed!`);
                    } else if (!mod.settings.hiddenClasses.includes(arg) || !mod.settings.hiddenRoles.includes(arg)) {
                        message(`Class/Role "${arg}" already displayed!!`);
                    } else
                        if (!mod.settings.blacklistedNames.includes(arg)) {
                            message(`Player "${arg}" is not hidden!`);
                        }
                }
                break
            case "party":
                mod.settings.party = !mod.settings.party
                if (mod.settings.party) {
                    for (let i in spawnedPlayers) {
                        if (!partyMembers.includes(spawnedPlayers[i].name)) {
                            mod.send('S_DESPAWN_USER', 3, {
                                gameId: spawnedPlayers[i].gameId,
                                type: 1
                            });
                            hiddenUsers[spawnedPlayers[i].gameId] = spawnedPlayers[i];
                        }
                    }
                } else {
                    showAll()
                }
                message(`Hiding of everyone but your group ${mod.settings.party ? 'en' : 'dis'}abled`);

                break
            case "list":
                message(`Hidden players: ${mod.settings.blacklistedNames}`);
                message(`Hidden classes: ${mod.settings.hiddenClasses}`);
                message(`Hidden roles: ${mod.settings.hiddenRoles}`);
                break
            case "summons":
                switch (arg) {
                    case undefined:
                        mod.settings.hideAllSummons = !mod.settings.hideAllSummons;
                        message(`Hiding of summoned NPCs ${mod.settings.hideAllSummons ? 'en' : 'dis'}abled`);
                        break;
                    case "mine":
                        mod.settings.keepMySummons = !mod.settings.keepMySummons;
                        message(`Hiding of owned summoned NPCs ${mod.settings.keepMySummons ? 'dis' : 'en'}abled`);
                        break;
                }
                break
            case "skills":
            case "skill":
                switch (arg) {
                    case "blacklist":
                    case "black":
                        mod.settings.blacklistSkills = !mod.settings.blacklistSkills;
                        message(`Hiding of blacklisted skills ${mod.settings.blacklistSkills ? 'en' : 'dis'}abled`);
                        break
                    case "class":
                        if (mod.settings.classNames.includes(arg2)) {
                            for (let i in mod.settings.classes) {
                                if (mod.settings.classes[i].name === arg2) {
                                    if (arg3 != null && !isNaN(arg3) && arg3 < 50) {
                                        if (mod.settings.classes[i].blockedSkills.includes(arg3)) {
                                            let index = mod.settings.classes[i].blockedSkills.indexOf(arg3)
                                            if (index !== -1) {
                                                mod.settings.classes[i].blockedSkills.splice(index, 1)
                                                message(`Skill ID ${arg3} showing for class ${arg2}`)
                                            }
                                            return
                                        } else {
                                            mod.settings.classes[i].blockedSkills.push(arg3)
                                            message(`Skill ID ${arg3} hidden for class ${arg2}`)
                                            return
                                        }

                                    } else {
                                        mod.settings.classes[i].blockingSkills = !mod.settings.classes[i].blockingSkills;
                                        message(`Hidding ALL skills for the class ${arg2} ${mod.settings.classes[i].blockingSkills ? 'en' : 'dis'}abled`);
                                        return;
                                    }
                                }
                            }

                        } else
                            message(`Class ${arg2} not found!`);
                        break
                }
                break
            case "npcs":
            case "npc":
                if (arg == 'hide') {
                    let found = mod.settings.hiddenNpcs.some((s) => {
                        return s.zone === arg2 && s.templateId === arg3;
                    });
                    if (found) {
                        message(`NPC form huntingZone "${arg2} with templateId "${arg3}" now showing`)
                        mod.settings.hiddenNpcs = mod.settings.hiddenNpcs.filter((obj) => {
                            return obj.zone != arg2 || obj.templateId != arg3;
                        })

                    } else {
                        message(`NPC form huntingZone "${arg2} with templateId "${arg3}" hidden`)
                        mod.settings.hiddenNpcs.push({ zone: arg2, templateId: arg3 })
                    }
                    return

                    /*mod.settings.hiddenNpcs = mod.settings.hiddenNpcs.filter((e) => { // wow an arrow thanks eslint
                        if (e.zone == arg2 || e.templateId == arg3) {
                            message(`NPC form huntingZone "${arg2} with templateId "${arg3}" now showing`)
                            return e.zone != arg2 || e.templateId != arg3
                        } else {
                            
                        }
                    })
                    mod.settings.hiddenNpcs.push({ zone: arg2, templateId: arg3 })
                    message(`NPC form huntingZone "${arg2} with templateId "${arg3}" hidden`)
                    return*/
                } else
                    mod.settings.blacklistNpcs = !mod.settings.blacklistNpcs;
                message(`Hiding of blacklisted NPCs ${mod.settings.blacklistNpcs ? 'en' : 'dis'}abled`);
                break
            case "hit":
                switch (arg) {
                    case "me":
                        mod.settings.hitMe = !mod.settings.hitMe;
                        message(`Hiding of the players skill hits ${mod.settings.hitMe ? 'en' : 'dis'}abled`);
                        break
                    case "other":
                        mod.settings.hitOther = !mod.settings.hitOther;
                        message(`Hiding of other players skill hits ${mod.settings.hitOther ? 'en' : 'dis'}abled`);
                        break
                    case "damage":
                        mod.settings.hitDamage = !mod.settings.hitDamage;
                        message(`Hiding of the players skill damage numbers ${mod.settings.hitDamage ? 'en' : 'dis'}abled`);
                        break
                    default:
                        message(`Unrecognized sub-mod.command "${arg}"!`);
                        break
                }
                break
            case "fireworks":
            case "firework":
                mod.settings.hideFireworks = !mod.settings.hideFireworks;
                message(`Hiding of firework effects ${mod.settings.hideFireworks ? 'en' : 'dis'}abled`);
                break
            case "fpsbooster9001":
            case "effects":
            case "abnormies":
                switch (arg) {
                    case "all":
                        mod.settings.hideAllAbnormies = !mod.settings.hideAllAbnormies;
                        message(`Hiding of ALL abnormality effects on players ${mod.settings.hideAllAbnormies ? 'en' : 'dis'}abled`);
                        break
                    case "blacklist":
                    case "black":
                        mod.settings.blacklistAbnormies = !mod.settings.blacklistAbnormies;
                        message(`Hiding of blacklisted abnormality effects ${mod.settings.blacklistAbnormies ? 'en' : 'dis'}abled`);
                        break
                }
                break
            case "costume":
            case "style":
                mod.settings.showStyle = !mod.settings.showStyle;
                message(`Displaying of all players as wearing default costumes ${mod.settings.showStyle ? 'en' : 'dis'}abled, you will have to leave and re-enter the zone for this to take effect`);
                break
            case "proj":
            case "projectile":
                switch (arg) {
                    case "all":
                        mod.settings.hideProjectiles = !mod.settings.hideProjectiles;
                        message(`Hiding of ALL projectile effects ${mod.settings.hideProjectiles ? 'en' : 'dis'}abled`);
                        break
                    case "blacklist":
                        mod.settings.blacklistProjectiles = !mod.settings.blacklistProjectiles;
                        message(`Hiding of ALL projectile effects ${mod.settings.blacklistProjectiles ? 'en' : 'dis'}abled`);
                        break
                }
                break
            default:
                message(`Unknown command! Please refer to the readme for more information`);
                break
        }

    });
    // ~~~ * Functions * ~~~
    function message(msg) {
        mod.command.message(`<font color="#e0d3f5">${msg}`);
    }

    function getClass(m) {
        return (m % 100);
    }

    function hidePlayer(name) {
        for (let i in spawnedPlayers) {
            if (spawnedPlayers[i].name.toString().toLowerCase() === name.toLowerCase()) {
                mod.send('S_DESPAWN_USER', 3, {
                    gameId: spawnedPlayers[i].gameId,
                    type: 1
                });
                hiddenUsers[spawnedPlayers[i].gameId] = spawnedPlayers[i];
                return;
            }
        }
    }

    function removeName(name) {
        var what, a = arguments, L = a.length, ax;
        while (L > 1 && name.length) {
            what = a[--L];
            while ((ax = name.indexOf(what)) !== -1) {
                name.splice(ax, 1);
            }
        }
        return name;
    }

    function showPlayer(name) {
        for (let i in hiddenUsers) {
            if (hiddenUsers[i].name.toString().toLowerCase() === name.toLowerCase()) {
                mod.send('S_SPAWN_USER', 13, hiddenUsers[i]);
                delete hiddenUsers[i];
                return;
            }
        }
    }

    function hideAll() {
        if (!mod.settings.party) {
            for (let i in spawnedPlayers) {
                mod.send('S_DESPAWN_USER', 3, {
                    gameId: spawnedPlayers[i].gameId,
                    type: 1
                });
                hiddenUsers[spawnedPlayers[i].gameId] = spawnedPlayers[i];
            }
        }
    }

    function showAll() {
        for (let i in hiddenUsers) {
            mod.send('S_SPAWN_USER', 13, hiddenUsers[i]);
            delete hiddenUsers[i];
        }
    }

    function updateLoc(event) {
        mod.send('S_USER_LOCATION', 5, {
            gameId: event.gameId,
            loc: event.loc,
            dest: event.loc,
            w: event.w,
            speed: 300,
            type: 7
        });
    }

    // ~~~* Hooks * ~~~
    // note: for skills, do if classes[event.templateId].blockedSkills !== 

    mod.hook('S_LOGIN', 10, (event) => {
        myId = event.gameId;
    });

    mod.game.on('leave_game', () => {
        clearInterval(NASux)
    })
    mod.hook('S_SPAWN_USER', 13, { order: 9999 }, (event) => {
        spawnedPlayers[event.gameId] = event;
        if (mod.settings.mode === 3 || mod.settings.blacklistedNames.includes(event.name.toString().toLowerCase()) || mod.settings.classes[getClass(event.templateId)].isHidden === true || (mod.settings.party && !partyMembers.includes(event.name))) { //includes should work!!
            hiddenUsers[event.gameId] = event;
            return false;
        }
        if (mod.settings.showStyle) {
            event.weaponEnchant = 0;
            event.body = 0;
            event.hand = 0;
            event.feet = 0;
            event.underwear = 0;
            event.head = 0;
            event.face = 0;
            event.weapon = 0;
            event.showStyle = false;
            return true;
        }
    });

    mod.hook('S_USER_EXTERNAL_CHANGE', 6, { order: 9999 }, (event) => {
        if (mod.settings.showStyle && event.gameId !== myId) {
            event.weaponEnchant = 0;
            event.body = 0;
            event.hand = 0;
            event.feet = 0;
            event.underwear = 0;
            event.head = 0;
            event.face = 0;
            event.weapon = 0;
            event.showStyle = false;
            return true;
        }
    });

    mod.hook('S_SPAWN_USER', 13, { order: 99999, filter: { fake: null } }, (event) => {
        if (mod.settings.showStyle) {
            event.weaponEnchant = 0;
            event.body = 0;
            event.hand = 0;
            event.feet = 0;
            event.underwear = 0;
            event.head = 0;
            event.face = 0;
            event.weapon = 0;
            event.showStyle = false;
            return true;
        }
    });

    mod.hook('S_DESPAWN_USER', 3, { order: 999 }, (event) => {
        delete hiddenUsers[event.gameId];
        delete spawnedPlayers[event.gameId];
    });

    mod.hook('S_LOAD_TOPO', 'raw', () => {
        spawnedPlayers = {};
        hiddenUsers = {};
        hiddenNpcs = {};
    });

    mod.hook('S_LEAVE_PARTY', 1, () => {
        partyMembers = []
    })

    mod.hook('S_PARTY_MEMBER_LIST', 7, (event) => {
        event.members.map((value) => {
            partyMembers.push(value.name)
        })
    })

    mod.hook('S_SPAWN_NPC', 10, (event) => {
        if (mod.settings.hideAllSummons && event.huntingZoneId === 1023) {
            if (mod.settings.keepMySummons && mod.game.me.is(event.owner)) return true;
            hiddenNpcs[event.gameId] = event; // apparently NPCs get feared and crash the client too
            return false;
        }
        if (mod.settings.blacklistNpcs) {
            for (var i = 0; i < mod.settings.hiddenNpcs.length; i++) {
                if (event.huntingZoneId == mod.settings.hiddenNpcs[i].zone && event.templateId == mod.settings.hiddenNpcs[i].templateId) {
                    hiddenNpcs[event.gameId] = event;
                    return false;
                }
            }
        }
        if (mod.settings.hideFireworks && event.huntingZoneId === 1023 && (event.templateId === 60016000 || event.templateId === 80037000)) {
            return false;
        }
    });

    mod.hook('S_DESPAWN_NPC', 3, (event) => {
        delete hiddenNpcs[event.gameId];
    });

    mod.hook('S_EACH_SKILL_RESULT', 12, { order: 200 }, (event) => {
        if (event.source == myId || event.owner == myId) {
            if (mod.settings.hitMe) {
                event.skill.id = '';
                return true;
            }
            if (mod.settings.hitDamage) {
                event.damage = '';
                return true;
            }
        }
        if (mod.settings.hitOther && (spawnedPlayers[event.owner] || spawnedPlayers[event.source]) && event.target !== myId) {
            event.skill.id = '';
            return true;
        }
    });

    mod.hook('S_USER_LOCATION', 5, (event) => {
        if (hiddenUsers[event.gameId] === undefined) {
            return;
        }
        hiddenUsers[event.gameId].loc = event.dest;
        if (hiddenUsers[event.gameId]) {
            return false;
        }
    });



    mod.hook('S_ACTION_STAGE', 8, { order: 999 }, (event) => {
        if (event.gameId !== myId && spawnedPlayers[event.gameId]) {
            if (event.target !== myId && (mod.settings.mode === 2 || hiddenUsers[event.gameId])) {
                updateLoc(event);
                return false;
            }
            if (mod.settings.blacklistSkills) {
                if (typeof mod.settings.classes[getClass(event.templateId)].blockedSkills !== "undefined" && mod.settings.classes[getClass(event.templateId)].blockedSkills.includes(event.skill.id / 10000).toString()) {
                    updateLoc(event);
                    return false;
                }
            }
            if (mod.settings.classes[getClass(event.templateId)].blockingSkills) {
                updateLoc(event);
                return false;
            }
        }
    });

    mod.hook('S_START_USER_PROJECTILE', 9, { order: 999 }, (event) => { // end my life
        if (event.gameId !== myId && spawnedPlayers[event.gameId] && (hiddenUsers[event.gameId] || mod.settings.mode > 0 || mod.settings.hideProjectiles)) {
            return false;
        }
        if (mod.settings.blacklistProjectiles && mod.settings.hiddenProjectiles.includes(event.skill.id)) {
            return false;
        }
    });

    mod.hook('S_SPAWN_PROJECTILE', 5, { order: 999 }, (event) => {
        if (event.gameId !== myId && spawnedPlayers[event.gameId] && (hiddenUsers[event.gameId] || mod.settings.mode > 0 || mod.settings.hideProjectiles)) {
            return false;
        }
        if (mod.settings.blacklistProjectiles && mod.settings.hiddenProjectiles.includes(event.skill.id)) {
            return false;
        }
    });

    mod.hook('S_FEARMOVE_STAGE', 1, (event) => { // we block these to prevent game crashes
        if ((event.target !== myId && mod.settings.mode === 3) || hiddenUsers[event.target] || hiddenNpcs[event.target]) {
            return false;
        }
    });
    mod.hook('S_FEARMOVE_END', 1, (event) => {
        if ((event.target !== myId && mod.settings.mode === 3) || hiddenUsers[event.target] || hiddenNpcs[event.target]) {
            return false;
        }
    });

    mod.hook('S_MOUNT_VEHICLE', 2, (event) => {
        if (hiddenUsers[event.gameId]) {
            hiddenUsers[event.gameId].mount = event.id
        }
    });

    mod.hook('S_UNMOUNT_VEHICLE', 2, (event) => {
        if (hiddenUsers[event.gameId]) {
            hiddenUsers[event.gameId].mount = 0
        }
    });

    mod.hook('S_UNICAST_TRANSFORM_DATA', 4, { order: 99999 }, (event) => { //Thanks Trance!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! 
        if (mod.settings.showStyle && event.gameId !== myId) { //Thanks Trance!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! 
            return false;//Thanks Trance!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! 
        }//Thanks Trance!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! 
    });//Thanks Trance!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! 

    mod.hook('S_USER_MOVETYPE', 'raw', () => { //this little boi crashes us, raw due to def missing from caali
        return false;
    });

    mod.hook('S_ABNORMALITY_REFRESH', 1, (event) => {
        if (hiddenUsers[event.target]) {
            return false;
        }
    });

    mod.hook('S_ABNORMALITY_BEGIN', 3, { order: 999 }, (event) => {
        if (hiddenUsers[event.target]) {
            return false;
        }
        if (mod.settings.blacklistAbnormies && mod.settings.hiddenAbnormies.includes(event.id)) {
            return false;
        }
        if (mod.settings.hideAllAbnormies && event.target !== myId && (spawnedPlayers[event.target] && spawnedPlayers[event.source])) {
            return false;
        }
    });

	mod.hook('C_USE_ITEM', 3, (event) => {
		//if (event.id === fps_UI) {
		//if (event.id === mod.settings.openui.includes(event.id.id)) {
		if (mod.settings.openui.includes(event.id)) {
			handleGui();
			return false;
		}
	});
};
