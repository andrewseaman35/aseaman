const villagers = [
    {
        "id": "admiral",
        "name": "Admiral",
        "gender": "M",
        "personality": "Cranky",
        "species": "Bird",
        "birthday": "January 27th",
        "catchPhrase": "\"aye aye\"",
        "hobbies": "Nature"
    },
    {
        "id": "agent_s",
        "name": "Agent S",
        "gender": "F",
        "personality": "Peppy",
        "species": "Squirrel",
        "birthday": "July 2nd",
        "catchPhrase": "\"sidekick\"",
        "hobbies": "Fitness"
    },
    {
        "id": "agnes",
        "name": "Agnes",
        "gender": "F",
        "personality": "Sisterly",
        "species": "Pig",
        "birthday": "April 21st",
        "catchPhrase": "\"snuffle\"",
        "hobbies": "Play"
    },
    {
        "id": "al",
        "name": "Al",
        "gender": "M",
        "personality": "Lazy",
        "species": "Gorilla",
        "birthday": "October 18th",
        "catchPhrase": "\"Ayyeeee\"",
        "hobbies": "Fitness"
    },
    {
        "id": "alfonso",
        "name": "Alfonso",
        "gender": "M",
        "personality": "Lazy",
        "species": "Alligator",
        "birthday": "June 9th",
        "catchPhrase": "\"it'sa me\"",
        "hobbies": "Play"
    },
    {
        "id": "alice",
        "name": "Alice",
        "gender": "F",
        "personality": "Normal",
        "species": "Koala",
        "birthday": "August 19th",
        "catchPhrase": "\"guvnor\"",
        "hobbies": "Education"
    },
    {
        "id": "alli",
        "name": "Alli",
        "gender": "F",
        "personality": "Snooty",
        "species": "Alligator",
        "birthday": "November 8th",
        "catchPhrase": "\"graaagh\"",
        "hobbies": "Fashion"
    },
    {
        "id": "amelia",
        "name": "Amelia",
        "gender": "F",
        "personality": "Snooty",
        "species": "Eagle",
        "birthday": "November 19th",
        "catchPhrase": "\"cuz\"",
        "hobbies": "Music"
    },
    {
        "id": "anabelle",
        "name": "Anabelle",
        "gender": "F",
        "personality": "Peppy",
        "species": "Anteater",
        "birthday": "February 16th",
        "catchPhrase": "\"snorty\"",
        "hobbies": "Fashion"
    },
    {
        "id": "anchovy",
        "name": "Anchovy",
        "gender": "M",
        "personality": "Lazy",
        "species": "Bird",
        "birthday": "March 4th",
        "catchPhrase": "\"chuurp\"",
        "hobbies": "Play"
    },
    {
        "id": "ankha",
        "name": "Ankha",
        "gender": "F",
        "personality": "Snooty",
        "species": "Cat",
        "birthday": "September 22nd",
        "catchPhrase": "\"me meow\"",
        "hobbies": "Nature"
    },
    {
        "id": "angus",
        "name": "Angus",
        "gender": "M",
        "personality": "Cranky",
        "species": "Bull",
        "birthday": "April 30th",
        "catchPhrase": "\"macmoo\"",
        "hobbies": "Fitness"
    },
    {
        "id": "anicotti",
        "name": "Anicotti",
        "gender": "F",
        "personality": "Peppy",
        "species": "Mouse",
        "birthday": "February 24th",
        "catchPhrase": "\"cannoli\"",
        "hobbies": "Fashion"
    },
    {
        "id": "annalisa",
        "name": "Annalisa",
        "gender": "F",
        "personality": "Normal",
        "species": "Anteater",
        "birthday": "February 6th",
        "catchPhrase": "\"gumdrop\"",
        "hobbies": "Nature"
    },
    {
        "id": "annalise",
        "name": "Annalise",
        "gender": "F",
        "personality": "Snooty",
        "species": "Horse",
        "birthday": "December 2nd",
        "catchPhrase": "\"nipper\"",
        "hobbies": "Fashion"
    },
    {
        "id": "antonio",
        "name": "Antonio",
        "gender": "M",
        "personality": "Jock",
        "species": "Anteater",
        "birthday": "October 20th",
        "catchPhrase": "\"honk\"",
        "hobbies": "Fitness"
    },
    {
        "id": "apollo",
        "name": "Apollo",
        "gender": "M",
        "personality": "Cranky",
        "species": "Eagle",
        "birthday": "July 4th",
        "catchPhrase": "\"pah\"",
        "hobbies": "Music"
    },
    {
        "id": "apple",
        "name": "Apple",
        "gender": "F",
        "personality": "Peppy",
        "species": "Hamster",
        "birthday": "September 24th",
        "catchPhrase": "\"cheekers\"",
        "hobbies": "Play"
    },
    {
        "id": "astrid",
        "name": "Astrid",
        "gender": "F",
        "personality": "Snooty",
        "species": "Kangaroo",
        "birthday": "September 8th",
        "catchPhrase": "\"my pet\"",
        "hobbies": "Music"
    },
    {
        "id": "audie",
        "name": "Audie",
        "gender": "F",
        "personality": "Peppy",
        "species": "Wolf",
        "birthday": "August 31st",
        "catchPhrase": "\"Foxtrot\"",
        "hobbies": "Fitness"
    },
    {
        "id": "aurora",
        "name": "Aurora",
        "gender": "F",
        "personality": "Normal",
        "species": "Penguin",
        "birthday": "January 27th",
        "catchPhrase": "\"b-b-baby\"",
        "hobbies": "Education"
    },
    {
        "id": "ava",
        "name": "Ava",
        "gender": "F",
        "personality": "Normal",
        "species": "Chicken",
        "birthday": "April 28th",
        "catchPhrase": "\"beaker\"",
        "hobbies": "Music"
    },
    {
        "id": "avery",
        "name": "Avery",
        "gender": "M",
        "personality": "Cranky",
        "species": "Eagle",
        "birthday": "February 22nd",
        "catchPhrase": "\"skree-haw\"",
        "hobbies": "Music"
    },
    {
        "id": "axel",
        "name": "Axel",
        "gender": "M",
        "personality": "Jock",
        "species": "Elephant",
        "birthday": "March 23rd",
        "catchPhrase": "\"WHONK\"",
        "hobbies": "Fitness"
    },
    {
        "id": "baabara",
        "name": "Baabara",
        "gender": "F",
        "personality": "Snooty",
        "species": "Sheep",
        "birthday": "March 28th",
        "catchPhrase": "\"daahling\"",
        "hobbies": "Fashion"
    },
    {
        "id": "bam",
        "name": "Bam",
        "gender": "M",
        "personality": "Jock",
        "species": "Deer",
        "birthday": "November 7th",
        "catchPhrase": "\"kablang\"",
        "hobbies": "Play"
    },
    {
        "id": "bangle",
        "name": "Bangle",
        "gender": "F",
        "personality": "Peppy",
        "species": "Tiger",
        "birthday": "August 27th",
        "catchPhrase": "\"growf\"",
        "hobbies": "Fashion"
    },
    {
        "id": "barold",
        "name": "Barold",
        "gender": "M",
        "personality": "Lazy",
        "species": "Cub",
        "birthday": "March 2nd",
        "catchPhrase": "\"cubby\"",
        "hobbies": "Play"
    },
    {
        "id": "bea",
        "name": "Bea",
        "gender": "F",
        "personality": "Normal",
        "species": "Dog",
        "birthday": "October 15th",
        "catchPhrase": "\"bingo\"",
        "hobbies": "Nature"
    },
    {
        "id": "beardo",
        "name": "Beardo",
        "gender": "M",
        "personality": "Smug",
        "species": "Bear",
        "birthday": "September 27th",
        "catchPhrase": "\"whiskers\"",
        "hobbies": "Education"
    },
    {
        "id": "beau",
        "name": "Beau",
        "gender": "M",
        "personality": "Lazy",
        "species": "Deer",
        "birthday": "April 5th",
        "catchPhrase": "\"saltlick\"",
        "hobbies": "Nature"
    },
    {
        "id": "becky",
        "name": "Becky",
        "gender": "F",
        "personality": "Snooty",
        "species": "Chicken",
        "birthday": "December 9th",
        "catchPhrase": "\"chicklet\"",
        "hobbies": "Music"
    },
    {
        "id": "bella",
        "name": "Bella",
        "gender": "F",
        "personality": "Peppy",
        "species": "Mouse",
        "birthday": "December 28th",
        "catchPhrase": "\"eeks\"",
        "hobbies": "Music"
    },
    {
        "id": "benedict",
        "name": "Benedict",
        "gender": "M",
        "personality": "Lazy",
        "species": "Chicken",
        "birthday": "October 10th",
        "catchPhrase": "\"uh-hoo\"",
        "hobbies": "Play"
    },
    {
        "id": "benjamin",
        "name": "Benjamin",
        "gender": "M",
        "personality": "Lazy",
        "species": "Dog",
        "birthday": "August 3rd",
        "catchPhrase": "\"alrighty\"",
        "hobbies": "Nature"
    },
    {
        "id": "bertha",
        "name": "Bertha",
        "gender": "F",
        "personality": "Normal",
        "species": "Hippo",
        "birthday": "April 25th",
        "catchPhrase": "\"bloop\"",
        "hobbies": "Education"
    },
    {
        "id": "bettina",
        "name": "Bettina",
        "gender": "F",
        "personality": "Normal",
        "species": "Mouse",
        "birthday": "June 12th",
        "catchPhrase": "\"eekers\"",
        "hobbies": "Education"
    },
    {
        "id": "bianca",
        "name": "Bianca",
        "gender": "F",
        "personality": "Peppy",
        "species": "Tiger",
        "birthday": "December 13th",
        "catchPhrase": "\"glimmer\"",
        "hobbies": "Play"
    },
    {
        "id": "biff",
        "name": "Biff",
        "gender": "M",
        "personality": "Jock",
        "species": "Hippo",
        "birthday": "March 29th",
        "catchPhrase": "\"squirt\"",
        "hobbies": "Fitness"
    },
    {
        "id": "big_top",
        "name": "Big Top",
        "gender": "M",
        "personality": "Lazy",
        "species": "Elephant",
        "birthday": "October 3rd",
        "catchPhrase": "\"villain\"",
        "hobbies": "Play"
    },
    {
        "id": "bill",
        "name": "Bill",
        "gender": "M",
        "personality": "Jock",
        "species": "Duck",
        "birthday": "February 1st",
        "catchPhrase": "\"quacko\"",
        "hobbies": "Play"
    },
    {
        "id": "billy",
        "name": "Billy",
        "gender": "M",
        "personality": "Jock",
        "species": "Goat",
        "birthday": "March 25th",
        "catchPhrase": "\"dagnaabit\"",
        "hobbies": "Play"
    },
    {
        "id": "biskit",
        "name": "Biskit",
        "gender": "M",
        "personality": "Lazy",
        "species": "Dog",
        "birthday": "May 13th",
        "catchPhrase": "\"dog\"",
        "hobbies": "Play"
    },
    {
        "id": "bitty",
        "name": "Bitty",
        "gender": "F",
        "personality": "Snooty",
        "species": "Hippo",
        "birthday": "October 6th",
        "catchPhrase": "\"my dear\"",
        "hobbies": "Education"
    },
    {
        "id": "blaire",
        "name": "Blaire",
        "gender": "F",
        "personality": "Snooty",
        "species": "Squirrel",
        "birthday": "July 3rd",
        "catchPhrase": "\"nutlet\"",
        "hobbies": "Fashion"
    },
    {
        "id": "blanche",
        "name": "Blanche",
        "gender": "F",
        "personality": "Snooty",
        "species": "Ostrich",
        "birthday": "December 21st",
        "catchPhrase": "\"quite so\"",
        "hobbies": "Nature"
    },
    {
        "id": "bluebear",
        "name": "Bluebear",
        "gender": "F",
        "personality": "Peppy",
        "species": "Cub",
        "birthday": "June 24th",
        "catchPhrase": "\"peach\"",
        "hobbies": "Fashion"
    },
    {
        "id": "bob",
        "name": "Bob",
        "gender": "M",
        "personality": "Lazy",
        "species": "Cat",
        "birthday": "January 1st",
        "catchPhrase": "\"pthhhpth\"",
        "hobbies": "Play"
    },
    {
        "id": "bonbon",
        "name": "Bonbon",
        "gender": "F",
        "personality": "Peppy",
        "species": "Rabbit",
        "birthday": "March 3rd",
        "catchPhrase": "\"deelish\"",
        "hobbies": "Play"
    },
    {
        "id": "bones",
        "name": "Bones",
        "gender": "M",
        "personality": "Lazy",
        "species": "Dog",
        "birthday": "August 4th",
        "catchPhrase": "\"yip yip\"",
        "hobbies": "Play"
    },
    {
        "id": "boomer",
        "name": "Boomer",
        "gender": "M",
        "personality": "Lazy",
        "species": "Penguin",
        "birthday": "February 7th",
        "catchPhrase": "\"human\"",
        "hobbies": "Fitness"
    },
    {
        "id": "boone",
        "name": "Boone",
        "gender": "M",
        "personality": "Jock",
        "species": "Gorilla",
        "birthday": "September 12th",
        "catchPhrase": "\"baboom\"",
        "hobbies": "Fitness"
    },
    {
        "id": "boots",
        "name": "Boots",
        "gender": "M",
        "personality": "Jock",
        "species": "Alligator",
        "birthday": "August 7th",
        "catchPhrase": "\"munchie\"",
        "hobbies": "Play"
    },
    {
        "id": "boris",
        "name": "Boris",
        "gender": "M",
        "personality": "Cranky",
        "species": "Pig",
        "birthday": "November 6th",
        "catchPhrase": "\"schnort\"",
        "hobbies": "Nature"
    },
    {
        "id": "boyd",
        "name": "Boyd",
        "gender": "M",
        "personality": "Cranky",
        "species": "Gorilla",
        "birthday": "October 1st",
        "catchPhrase": "\"uh-oh\"",
        "hobbies": "Fitness"
    },
    {
        "id": "bree",
        "name": "Bree",
        "gender": "F",
        "personality": "Snooty",
        "species": "Mouse",
        "birthday": "July 7th",
        "catchPhrase": "\"cheeseball\"",
        "hobbies": "Fashion"
    },
    {
        "id": "broccolo",
        "name": "Broccolo",
        "gender": "M",
        "personality": "Lazy",
        "species": "Mouse",
        "birthday": "June 30th",
        "catchPhrase": "\"eat it\"",
        "hobbies": "Play"
    },
    {
        "id": "broffina",
        "name": "Broffina",
        "gender": "F",
        "personality": "Snooty",
        "species": "Chicken",
        "birthday": "October 24th",
        "catchPhrase": "\"cluckadoo\"",
        "hobbies": "Music"
    },
    {
        "id": "bruce",
        "name": "Bruce",
        "gender": "M",
        "personality": "Cranky",
        "species": "Deer",
        "birthday": "May 26th",
        "catchPhrase": "\"gruff\"",
        "hobbies": "Nature"
    },
    {
        "id": "bubbles",
        "name": "Bubbles",
        "gender": "F",
        "personality": "Peppy",
        "species": "Hippo",
        "birthday": "September 18th",
        "catchPhrase": "\"hipster\"",
        "hobbies": "Fashion"
    },
    {
        "id": "buck",
        "name": "Buck",
        "gender": "M",
        "personality": "Jock",
        "species": "Horse",
        "birthday": "April 4th",
        "catchPhrase": "\"pardner\"",
        "hobbies": "Fitness"
    },
    {
        "id": "bud",
        "name": "Bud",
        "gender": "M",
        "personality": "Jock",
        "species": "Lion",
        "birthday": "August 8th",
        "catchPhrase": "\"shredded\"",
        "hobbies": "Fitness"
    },
    {
        "id": "bunnie",
        "name": "Bunnie",
        "gender": "F",
        "personality": "Peppy",
        "species": "Rabbit",
        "birthday": "May 9th",
        "catchPhrase": "\"tee-hee\"",
        "hobbies": "Fashion"
    },
    {
        "id": "butch",
        "name": "Butch",
        "gender": "M",
        "personality": "Cranky",
        "species": "Dog",
        "birthday": "November 1st",
        "catchPhrase": "\"ROOOOOWF\"",
        "hobbies": "Music"
    },
    {
        "id": "buzz",
        "name": "Buzz",
        "gender": "M",
        "personality": "Cranky",
        "species": "Eagle",
        "birthday": "December 7th",
        "catchPhrase": "\"captain\"",
        "hobbies": "Nature"
    },
    {
        "id": "cally",
        "name": "Cally",
        "gender": "F",
        "personality": "Normal",
        "species": "Squirrel",
        "birthday": "September 4th",
        "catchPhrase": "\"WHEE\"",
        "hobbies": "Nature"
    },
    {
        "id": "camofrog",
        "name": "Camofrog",
        "gender": "M",
        "personality": "Cranky",
        "species": "Frog",
        "birthday": "June 5th",
        "catchPhrase": "\"ten-hut\"",
        "hobbies": "Music"
    },
    {
        "id": "canberra",
        "name": "Canberra",
        "gender": "F",
        "personality": "Sisterly",
        "species": "Koala",
        "birthday": "May 14th",
        "catchPhrase": "\"nuh uh\"",
        "hobbies": "Play"
    },
    {
        "id": "candi",
        "name": "Candi",
        "gender": "F",
        "personality": "Peppy",
        "species": "Mouse",
        "birthday": "April 13th",
        "catchPhrase": "\"sweetie\"",
        "hobbies": "Play"
    },
    {
        "id": "carmen",
        "name": "Carmen",
        "gender": "F",
        "personality": "Peppy",
        "species": "Rabbit",
        "birthday": "January 6th",
        "catchPhrase": "\"nougat\"",
        "hobbies": "Fashion"
    },
    {
        "id": "caroline",
        "name": "Caroline",
        "gender": "F",
        "personality": "Normal",
        "species": "Squirrel",
        "birthday": "July 15th",
        "catchPhrase": "\"hulaaaa\"",
        "hobbies": "Music"
    },
    {
        "id": "carrie",
        "name": "Carrie",
        "gender": "F",
        "personality": "Normal",
        "species": "Kangaroo",
        "birthday": "December 5th",
        "catchPhrase": "\"little one\"",
        "hobbies": "Nature"
    },
    {
        "id": "cashmere",
        "name": "Cashmere",
        "gender": "F",
        "personality": "Snooty",
        "species": "Sheep",
        "birthday": "April 2nd",
        "catchPhrase": "\"baaaby\"",
        "hobbies": "Fashion"
    },
    {
        "id": "celia",
        "name": "Celia",
        "gender": "F",
        "personality": "Normal",
        "species": "Eagle",
        "birthday": "March 25th",
        "catchPhrase": "\"feathers\"",
        "hobbies": "Nature"
    },
    {
        "id": "cesar",
        "name": "Cesar",
        "gender": "M",
        "personality": "Cranky",
        "species": "Gorilla",
        "birthday": "September 6th",
        "catchPhrase": "\"highness\"",
        "hobbies": "Fitness"
    },
    {
        "id": "chadder",
        "name": "Chadder",
        "gender": "M",
        "personality": "Smug",
        "species": "Mouse",
        "birthday": "December 15th",
        "catchPhrase": "\"fromage\"",
        "hobbies": "Fitness"
    },
    {
        "id": "charlise",
        "name": "Charlise",
        "gender": "F",
        "personality": "Sisterly",
        "species": "Bear",
        "birthday": "April 17th",
        "catchPhrase": "\"urgh\"",
        "hobbies": "Fitness"
    },
    {
        "id": "cheri",
        "name": "Cheri",
        "gender": "F",
        "personality": "Peppy",
        "species": "Cub",
        "birthday": "March 17th",
        "catchPhrase": "\"tralala\"",
        "hobbies": "Fashion"
    },
    {
        "id": "cherry",
        "name": "Cherry",
        "gender": "F",
        "personality": "Sisterly",
        "species": "Dog",
        "birthday": "May 11th",
        "catchPhrase": "\"what what\"",
        "hobbies": "Music"
    },
    {
        "id": "chester",
        "name": "Chester",
        "gender": "M",
        "personality": "Lazy",
        "species": "Cub",
        "birthday": "August 6th",
        "catchPhrase": "\"rookie\"",
        "hobbies": "Play"
    },
    {
        "id": "chevre",
        "name": "Chevre",
        "gender": "F",
        "personality": "Normal",
        "species": "Goat",
        "birthday": "March 6th",
        "catchPhrase": "\"la baa\"",
        "hobbies": "Education"
    },
    {
        "id": "chief",
        "name": "Chief",
        "gender": "M",
        "personality": "Cranky",
        "species": "Wolf",
        "birthday": "December 19th",
        "catchPhrase": "\"harrumph\"",
        "hobbies": "Music"
    },
    {
        "id": "chops",
        "name": "Chops",
        "gender": "M",
        "personality": "Smug",
        "species": "Pig",
        "birthday": "October 13th",
        "catchPhrase": "\"zoink\"",
        "hobbies": "Education"
    },
    {
        "id": "chow",
        "name": "Chow",
        "gender": "M",
        "personality": "Cranky",
        "species": "Bear",
        "birthday": "July 22nd",
        "catchPhrase": "\"aiya\"",
        "hobbies": "Fitness"
    },
    {
        "id": "chrissy",
        "name": "Chrissy",
        "gender": "F",
        "personality": "Peppy",
        "species": "Rabbit",
        "birthday": "August 28th",
        "catchPhrase": "\"sparkles\"",
        "hobbies": "Fashion"
    },
    {
        "id": "claude",
        "name": "Claude",
        "gender": "M",
        "personality": "Lazy",
        "species": "Rabbit",
        "birthday": "December 3rd",
        "catchPhrase": "\"hopalong\"",
        "hobbies": "Music"
    },
    {
        "id": "claudia",
        "name": "Claudia",
        "gender": "F",
        "personality": "Snooty",
        "species": "Tiger",
        "birthday": "November 22nd",
        "catchPhrase": "\"ooh la la\"",
        "hobbies": "Music"
    },
    {
        "id": "clay",
        "name": "Clay",
        "gender": "M",
        "personality": "Lazy",
        "species": "Hamster",
        "birthday": "October 19th",
        "catchPhrase": "\"thump\"",
        "hobbies": "Nature"
    },
    {
        "id": "cleo",
        "name": "Cleo",
        "gender": "F",
        "personality": "Snooty",
        "species": "Horse",
        "birthday": "February 9th",
        "catchPhrase": "\"sugar\"",
        "hobbies": "Education"
    },
    {
        "id": "clyde",
        "name": "Clyde",
        "gender": "M",
        "personality": "Lazy",
        "species": "Horse",
        "birthday": "May 1st",
        "catchPhrase": "\"clip-clawp\"",
        "hobbies": "Play"
    },
    {
        "id": "coach",
        "name": "Coach",
        "gender": "M",
        "personality": "Jock",
        "species": "Bull",
        "birthday": "April 29th",
        "catchPhrase": "\"stubble\"",
        "hobbies": "Fitness"
    },
    {
        "id": "cobb",
        "name": "Cobb",
        "gender": "M",
        "personality": "Jock",
        "species": "Pig",
        "birthday": "October 7th",
        "catchPhrase": "\"hot dog\"",
        "hobbies": "Education"
    },
    {
        "id": "coco",
        "name": "Coco",
        "gender": "F",
        "personality": "Normal",
        "species": "Rabbit",
        "birthday": "March 1st",
        "catchPhrase": "\"doyoing\"",
        "hobbies": "Education"
    },
    {
        "id": "cole",
        "name": "Cole",
        "gender": "M",
        "personality": "Lazy",
        "species": "Rabbit",
        "birthday": "August 10th",
        "catchPhrase": "\"duuude\"",
        "hobbies": "Nature"
    },
    {
        "id": "colton",
        "name": "Colton",
        "gender": "M",
        "personality": "Smug",
        "species": "Horse",
        "birthday": "May 22nd",
        "catchPhrase": "\"check it\"",
        "hobbies": "Nature"
    },
    {
        "id": "cookie",
        "name": "Cookie",
        "gender": "F",
        "personality": "Peppy",
        "species": "Dog",
        "birthday": "June 18th",
        "catchPhrase": "\"arfer\"",
        "hobbies": "Fashion"
    },
    {
        "id": "cousteau",
        "name": "Cousteau",
        "gender": "M",
        "personality": "Jock",
        "species": "Frog",
        "birthday": "December 17th",
        "catchPhrase": "\"oui oui\"",
        "hobbies": "Fitness"
    },
    {
        "id": "cranston",
        "name": "Cranston",
        "gender": "M",
        "personality": "Lazy",
        "species": "Ostrich",
        "birthday": "September 23rd",
        "catchPhrase": "\"sweatband\"",
        "hobbies": "Nature"
    },
    {
        "id": "croque",
        "name": "Croque",
        "gender": "M",
        "personality": "Cranky",
        "species": "Frog",
        "birthday": "July 18th",
        "catchPhrase": "\"as if\"",
        "hobbies": "Nature"
    },
    {
        "id": "cube",
        "name": "Cube",
        "gender": "M",
        "personality": "Lazy",
        "species": "Penguin",
        "birthday": "January 29th",
        "catchPhrase": "\"brainfreeze\"",
        "hobbies": "Play"
    },
    {
        "id": "curlos",
        "name": "Curlos",
        "gender": "M",
        "personality": "Smug",
        "species": "Sheep",
        "birthday": "May 8th",
        "catchPhrase": "\"shearly\"",
        "hobbies": "Nature"
    },
    {
        "id": "curly",
        "name": "Curly",
        "gender": "M",
        "personality": "Jock",
        "species": "Pig",
        "birthday": "July 26th",
        "catchPhrase": "\"nyoink\"",
        "hobbies": "Fitness"
    },
    {
        "id": "curt",
        "name": "Curt",
        "gender": "M",
        "personality": "Cranky",
        "species": "Bear",
        "birthday": "July 1st",
        "catchPhrase": "\"fuzzball\"",
        "hobbies": "Nature"
    },
    {
        "id": "cyd",
        "name": "Cyd",
        "gender": "M",
        "personality": "Cranky",
        "species": "Elephant",
        "birthday": "June 9th",
        "catchPhrase": "\"rockin'\"",
        "hobbies": "Music"
    },
    {
        "id": "cyrano",
        "name": "Cyrano",
        "gender": "M",
        "personality": "Cranky",
        "species": "Anteater",
        "birthday": "March 9th",
        "catchPhrase": "\"ah-CHOO\"",
        "hobbies": "Education"
    },
    {
        "id": "daisy",
        "name": "Daisy",
        "gender": "F",
        "personality": "Normal",
        "species": "Dog",
        "birthday": "November 16th",
        "catchPhrase": "\"bow-WOW\"",
        "hobbies": "Education"
    },
    {
        "id": "deena",
        "name": "Deena",
        "gender": "F",
        "personality": "Normal",
        "species": "Duck",
        "birthday": "June 27th",
        "catchPhrase": "\"woowoo\"",
        "hobbies": "Play"
    },
    {
        "id": "deirdre",
        "name": "Deirdre",
        "gender": "F",
        "personality": "Sisterly",
        "species": "Deer",
        "birthday": "May 4th",
        "catchPhrase": "\"whatevs\"",
        "hobbies": "Play"
    },
    {
        "id": "del",
        "name": "Del",
        "gender": "M",
        "personality": "Cranky",
        "species": "Alligator",
        "birthday": "May 27th",
        "catchPhrase": "\"gronk\"",
        "hobbies": "Fitness"
    },
    {
        "id": "deli",
        "name": "Deli",
        "gender": "M",
        "personality": "Lazy",
        "species": "Monkey",
        "birthday": "May 24th",
        "catchPhrase": "\"monch\"",
        "hobbies": "Nature"
    },
    {
        "id": "derwin",
        "name": "Derwin",
        "gender": "M",
        "personality": "Lazy",
        "species": "Duck",
        "birthday": "May 25th",
        "catchPhrase": "\"derrrrr\"",
        "hobbies": "Play"
    },
    {
        "id": "diana",
        "name": "Diana",
        "gender": "F",
        "personality": "Snooty",
        "species": "Deer",
        "birthday": "January 4th",
        "catchPhrase": "\"no doy\"",
        "hobbies": "Education"
    },
    {
        "id": "diva",
        "name": "Diva",
        "gender": "F",
        "personality": "Sisterly",
        "species": "Frog",
        "birthday": "October 2nd",
        "catchPhrase": "\"ya know\"",
        "hobbies": "Fitness"
    },
    {
        "id": "dizzy",
        "name": "Dizzy",
        "gender": "M",
        "personality": "Lazy",
        "species": "Elephant",
        "birthday": "January 14th",
        "catchPhrase": "\"woo-oo\"",
        "hobbies": "Play"
    },
    {
        "id": "dobie",
        "name": "Dobie",
        "gender": "M",
        "personality": "Cranky",
        "species": "Wolf",
        "birthday": "February 17th",
        "catchPhrase": "\"ohmmm\"",
        "hobbies": "Nature"
    },
    {
        "id": "doc",
        "name": "Doc",
        "gender": "M",
        "personality": "Lazy",
        "species": "Rabbit",
        "birthday": "March 16th",
        "catchPhrase": "\"ol' bunny\"",
        "hobbies": "Education"
    },
    {
        "id": "dom",
        "name": "Dom",
        "gender": "M",
        "personality": "Jock",
        "species": "Sheep",
        "birthday": "March 18th",
        "catchPhrase": "\"indeedaroo\"",
        "hobbies": "Play"
    },
    {
        "id": "dora",
        "name": "Dora",
        "gender": "F",
        "personality": "Normal",
        "species": "Mouse",
        "birthday": "February 18th",
        "catchPhrase": "\"squeaky\"",
        "hobbies": "Education"
    },
    {
        "id": "dotty",
        "name": "Dotty",
        "gender": "F",
        "personality": "Peppy",
        "species": "Rabbit",
        "birthday": "March 14th",
        "catchPhrase": "\"wee one\"",
        "hobbies": "Fashion"
    },
    {
        "id": "drago",
        "name": "Drago",
        "gender": "M",
        "personality": "Lazy",
        "species": "Alligator",
        "birthday": "February 12th",
        "catchPhrase": "\"burrrn\"",
        "hobbies": "Nature"
    },
    {
        "id": "drake",
        "name": "Drake",
        "gender": "M",
        "personality": "Lazy",
        "species": "Duck",
        "birthday": "June 25th",
        "catchPhrase": "\"quacko\"",
        "hobbies": "Play"
    },
    {
        "id": "drift",
        "name": "Drift",
        "gender": "M",
        "personality": "Jock",
        "species": "Frog",
        "birthday": "October 9th",
        "catchPhrase": "\"brah\"",
        "hobbies": "Fitness"
    },
    {
        "id": "ed",
        "name": "Ed",
        "gender": "M",
        "personality": "Smug",
        "species": "Horse",
        "birthday": "September 16th",
        "catchPhrase": "\"greenhorn\"",
        "hobbies": "Nature"
    },
    {
        "id": "egbert",
        "name": "Egbert",
        "gender": "M",
        "personality": "Lazy",
        "species": "Chicken",
        "birthday": "October 14th",
        "catchPhrase": "\"doodle-duh\"",
        "hobbies": "Play"
    },
    {
        "id": "elise",
        "name": "Elise",
        "gender": "F",
        "personality": "Snooty",
        "species": "Monkey",
        "birthday": "March 21st",
        "catchPhrase": "\"puh-lease\"",
        "hobbies": "Fashion"
    },
    {
        "id": "ellie",
        "name": "Ellie",
        "gender": "F",
        "personality": "Normal",
        "species": "Elephant",
        "birthday": "May 12th",
        "catchPhrase": "\"li'l one\"",
        "hobbies": "Nature"
    },
    {
        "id": "elmer",
        "name": "Elmer",
        "gender": "M",
        "personality": "Lazy",
        "species": "Horse",
        "birthday": "October 5th",
        "catchPhrase": "\"tenderfoot\"",
        "hobbies": "Play"
    },
    {
        "id": "eloise",
        "name": "Eloise",
        "gender": "F",
        "personality": "Snooty",
        "species": "Elephant",
        "birthday": "December 8th",
        "catchPhrase": "\"tooooot\"",
        "hobbies": "Fashion"
    },
    {
        "id": "elvis",
        "name": "Elvis",
        "gender": "M",
        "personality": "Cranky",
        "species": "Lion",
        "birthday": "July 23rd",
        "catchPhrase": "\"unh-hunh\"",
        "hobbies": "Education"
    },
    {
        "id": "erik",
        "name": "Erik",
        "gender": "M",
        "personality": "Lazy",
        "species": "Deer",
        "birthday": "July 27th",
        "catchPhrase": "\"chow down\"",
        "hobbies": "Nature"
    },
    {
        "id": "eunice",
        "name": "Eunice",
        "gender": "F",
        "personality": "Normal",
        "species": "Sheep",
        "birthday": "April 3rd",
        "catchPhrase": "\"lambchop\"",
        "hobbies": "Fashion"
    },
    {
        "id": "eugene",
        "name": "Eugene",
        "gender": "M",
        "personality": "Smug",
        "species": "Koala",
        "birthday": "October 26th",
        "catchPhrase": "\"yeah buddy\"",
        "hobbies": "Music"
    },
    {
        "id": "fang",
        "name": "Fang",
        "gender": "M",
        "personality": "Cranky",
        "species": "Wolf",
        "birthday": "December 18th",
        "catchPhrase": "\"cha-chomp\"",
        "hobbies": "Education"
    },
    {
        "id": "fauna",
        "name": "Fauna",
        "gender": "F",
        "personality": "Normal",
        "species": "Deer",
        "birthday": "March 26th",
        "catchPhrase": "\"dearie\"",
        "hobbies": "Nature"
    },
    {
        "id": "felicity",
        "name": "Felicity",
        "gender": "F",
        "personality": "Peppy",
        "species": "Cat",
        "birthday": "March 30th",
        "catchPhrase": "\"mimimi\"",
        "hobbies": "Fashion"
    },
    {
        "id": "filbert",
        "name": "Filbert",
        "gender": "M",
        "personality": "Lazy",
        "species": "Squirrel",
        "birthday": "June 3rd",
        "catchPhrase": "\"bucko\"",
        "hobbies": "Nature"
    },
    {
        "id": "flip",
        "name": "Flip",
        "gender": "M",
        "personality": "Jock",
        "species": "Monkey",
        "birthday": "November 21st",
        "catchPhrase": "\"rerack\"",
        "hobbies": "Music"
    },
    {
        "id": "flo",
        "name": "Flo",
        "gender": "F",
        "personality": "Sisterly",
        "species": "Penguin",
        "birthday": "September 2nd",
        "catchPhrase": "\"cha\"",
        "hobbies": "Music"
    },
    {
        "id": "flora",
        "name": "Flora",
        "gender": "F",
        "personality": "Peppy",
        "species": "Ostrich",
        "birthday": "February 9th",
        "catchPhrase": "\"pinky\"",
        "hobbies": "Play"
    },
    {
        "id": "flurry",
        "name": "Flurry",
        "gender": "F",
        "personality": "Normal",
        "species": "Hamster",
        "birthday": "January 30th",
        "catchPhrase": "\"powderpuff\"",
        "hobbies": "Nature"
    },
    {
        "id": "francine",
        "name": "Francine",
        "gender": "F",
        "personality": "Snooty",
        "species": "Rabbit",
        "birthday": "January 22nd",
        "catchPhrase": "\"karat\"",
        "hobbies": "Fashion"
    },
    {
        "id": "frank",
        "name": "Frank",
        "gender": "M",
        "personality": "Cranky",
        "species": "Eagle",
        "birthday": "July 30th",
        "catchPhrase": "\"crushy\"",
        "hobbies": "Education"
    },
    {
        "id": "freckles",
        "name": "Freckles",
        "gender": "F",
        "personality": "Peppy",
        "species": "Duck",
        "birthday": "February 19th",
        "catchPhrase": "\"ducky\"",
        "hobbies": "Fashion"
    },
    {
        "id": "freya",
        "name": "Freya",
        "gender": "F",
        "personality": "Snooty",
        "species": "Wolf",
        "birthday": "December 14th",
        "catchPhrase": "\"uff da\"",
        "hobbies": "Fashion"
    },
    {
        "id": "friga",
        "name": "Friga",
        "gender": "F",
        "personality": "Snooty",
        "species": "Penguin",
        "birthday": "October 16th",
        "catchPhrase": "\"brrmph\"",
        "hobbies": "Fashion"
    },
    {
        "id": "frita",
        "name": "Frita",
        "gender": "F",
        "personality": "Sisterly",
        "species": "Sheep",
        "birthday": "July 16th",
        "catchPhrase": "\"oh ewe\"",
        "hobbies": "Music"
    },
    {
        "id": "frobert",
        "name": "Frobert",
        "gender": "M",
        "personality": "Jock",
        "species": "Frog",
        "birthday": "February 8th",
        "catchPhrase": "\"fribbit\"",
        "hobbies": "Fitness"
    },
    {
        "id": "fuchsia",
        "name": "Fuchsia",
        "gender": "F",
        "personality": "Sisterly",
        "species": "Deer",
        "birthday": "September 19th",
        "catchPhrase": "\"precious\"",
        "hobbies": "Music"
    },
    {
        "id": "gabi",
        "name": "Gabi",
        "gender": "F",
        "personality": "Peppy",
        "species": "Rabbit",
        "birthday": "December 16th",
        "catchPhrase": "\"honeybun\"",
        "hobbies": "Fashion"
    },
    {
        "id": "gala",
        "name": "Gala",
        "gender": "F",
        "personality": "Normal",
        "species": "Pig",
        "birthday": "March 5th",
        "catchPhrase": "\"snortie\"",
        "hobbies": "Education"
    },
    {
        "id": "gaston",
        "name": "Gaston",
        "gender": "M",
        "personality": "Cranky",
        "species": "Rabbit",
        "birthday": "October 28th",
        "catchPhrase": "\"mon chou\"",
        "hobbies": "Education"
    },
    {
        "id": "gayle",
        "name": "Gayle",
        "gender": "F",
        "personality": "Normal",
        "species": "Alligator",
        "birthday": "May 17th",
        "catchPhrase": "\"snacky\"",
        "hobbies": "Nature"
    },
    {
        "id": "genji",
        "name": "Genji",
        "gender": "M",
        "personality": "Jock",
        "species": "Rabbit",
        "birthday": "January 21st",
        "catchPhrase": "\"mochi\"",
        "hobbies": "Fitness"
    },
    {
        "id": "gigi",
        "name": "Gigi",
        "gender": "F",
        "personality": "Snooty",
        "species": "Frog",
        "birthday": "August 11th",
        "catchPhrase": "\"ribette\"",
        "hobbies": "Fashion"
    },
    {
        "id": "gladys",
        "name": "Gladys",
        "gender": "F",
        "personality": "Normal",
        "species": "Ostrich",
        "birthday": "January 15th",
        "catchPhrase": "\"stretch\"",
        "hobbies": "Education"
    },
    {
        "id": "gloria",
        "name": "Gloria",
        "gender": "F",
        "personality": "Snooty",
        "species": "Duck",
        "birthday": "August 12th",
        "catchPhrase": "\"quacker\"",
        "hobbies": "Fashion"
    },
    {
        "id": "goldie",
        "name": "Goldie",
        "gender": "F",
        "personality": "Normal",
        "species": "Dog",
        "birthday": "December 27th",
        "catchPhrase": "\"woof\"",
        "hobbies": "Nature"
    },
    {
        "id": "gonzo",
        "name": "Gonzo",
        "gender": "M",
        "personality": "Cranky",
        "species": "Koala",
        "birthday": "October 13th",
        "catchPhrase": "\"mate\"",
        "hobbies": "Nature"
    },
    {
        "id": "goose",
        "name": "Goose",
        "gender": "M",
        "personality": "Jock",
        "species": "Chicken",
        "birthday": "October 4th",
        "catchPhrase": "\"buh-kay\"",
        "hobbies": "Fitness"
    },
    {
        "id": "graham",
        "name": "Graham",
        "gender": "M",
        "personality": "Smug",
        "species": "Hamster",
        "birthday": "June 20th",
        "catchPhrase": "\"indeed\"",
        "hobbies": "Education"
    },
    {
        "id": "greta",
        "name": "Greta",
        "gender": "F",
        "personality": "Snooty",
        "species": "Mouse",
        "birthday": "September 5th",
        "catchPhrase": "\"yelp\"",
        "hobbies": "Education"
    },
    {
        "id": "grizzly",
        "name": "Grizzly",
        "gender": "M",
        "personality": "Cranky",
        "species": "Bear",
        "birthday": "July 31st",
        "catchPhrase": "\"grrr...\"",
        "hobbies": "Education"
    },
    {
        "id": "groucho",
        "name": "Groucho",
        "gender": "M",
        "personality": "Cranky",
        "species": "Bear",
        "birthday": "October 23rd",
        "catchPhrase": "\"grumble\"",
        "hobbies": "Music"
    },
    {
        "id": "gruff",
        "name": "Gruff",
        "gender": "M",
        "personality": "Cranky",
        "species": "Goat",
        "birthday": "August 29th",
        "catchPhrase": "\"bleh eh eh\"",
        "hobbies": "Music"
    },
    {
        "id": "gwen",
        "name": "Gwen",
        "gender": "F",
        "personality": "Snooty",
        "species": "Penguin",
        "birthday": "January 23rd",
        "catchPhrase": "\"h-h-hon\"",
        "hobbies": "Fashion"
    },
    {
        "id": "hamlet",
        "name": "Hamlet",
        "gender": "M",
        "personality": "Jock",
        "species": "Hamster",
        "birthday": "May 30th",
        "catchPhrase": "\"hammie\"",
        "hobbies": "Play"
    },
    {
        "id": "hamphrey",
        "name": "Hamphrey",
        "gender": "M",
        "personality": "Cranky",
        "species": "Hamster",
        "birthday": "February 25th",
        "catchPhrase": "\"snort\"",
        "hobbies": "Nature"
    },
    {
        "id": "hans",
        "name": "Hans",
        "gender": "M",
        "personality": "Smug",
        "species": "Gorilla",
        "birthday": "December 5th",
        "catchPhrase": "\"groovy\"",
        "hobbies": "Fitness"
    },
    {
        "id": "harry",
        "name": "Harry",
        "gender": "M",
        "personality": "Cranky",
        "species": "Hippo",
        "birthday": "January 7th",
        "catchPhrase": "\"beach bum\"",
        "hobbies": "Education"
    },
    {
        "id": "hazel",
        "name": "Hazel",
        "gender": "F",
        "personality": "Sisterly",
        "species": "Squirrel",
        "birthday": "August 30th",
        "catchPhrase": "\"uni-wow\"",
        "hobbies": "Play"
    },
    {
        "id": "henry",
        "name": "Henry",
        "gender": "M",
        "personality": "Smug",
        "species": "Frog",
        "birthday": "September 21st",
        "catchPhrase": "\"snoozit\"",
        "hobbies": "Music"
    },
    {
        "id": "hippeux",
        "name": "Hippeux",
        "gender": "M",
        "personality": "Smug",
        "species": "Hippo",
        "birthday": "October 15th",
        "catchPhrase": "\"natch\"",
        "hobbies": "Education"
    },
    {
        "id": "hopkins",
        "name": "Hopkins",
        "gender": "M",
        "personality": "Lazy",
        "species": "Rabbit",
        "birthday": "March 11th",
        "catchPhrase": "\"thumper\"",
        "hobbies": "Nature"
    },
    {
        "id": "hopper",
        "name": "Hopper",
        "gender": "M",
        "personality": "Cranky",
        "species": "Penguin",
        "birthday": "April 6th",
        "catchPhrase": "\"slushie\"",
        "hobbies": "Music"
    },
    {
        "id": "hornsby",
        "name": "Hornsby",
        "gender": "M",
        "personality": "Lazy",
        "species": "Rhino",
        "birthday": "March 20th",
        "catchPhrase": "\"schnozzle\"",
        "hobbies": "Nature"
    },
    {
        "id": "huck",
        "name": "Huck",
        "gender": "M",
        "personality": "Smug",
        "species": "Frog",
        "birthday": "July 9th",
        "catchPhrase": "\"hopper\"",
        "hobbies": "Fitness"
    },
    {
        "id": "hugh",
        "name": "Hugh",
        "gender": "M",
        "personality": "Lazy",
        "species": "Pig",
        "birthday": "December 30th",
        "catchPhrase": "\"snortle\"",
        "hobbies": "Play"
    },
    {
        "id": "iggly",
        "name": "Iggly",
        "gender": "M",
        "personality": "Jock",
        "species": "Penguin",
        "birthday": "November 2nd",
        "catchPhrase": "\"waddler\"",
        "hobbies": "Fitness"
    },
    {
        "id": "ike",
        "name": "Ike",
        "gender": "M",
        "personality": "Cranky",
        "species": "Bear",
        "birthday": "May 16th",
        "catchPhrase": "\"roadie\"",
        "hobbies": "Nature"
    },
    {
        "id": "jacob",
        "name": "Jacob",
        "gender": "M",
        "personality": "Lazy",
        "species": "Bird",
        "birthday": "August 24th",
        "catchPhrase": "\"chuuuuurp\"",
        "hobbies": "Nature"
    },
    {
        "id": "jacques",
        "name": "Jacques",
        "gender": "M",
        "personality": "Smug",
        "species": "Bird",
        "birthday": "June 22nd",
        "catchPhrase": "\"zut alors\"",
        "hobbies": "Music"
    },
    {
        "id": "jambette",
        "name": "Jambette",
        "gender": "F",
        "personality": "Normal",
        "species": "Frog",
        "birthday": "October 27th",
        "catchPhrase": "\"croak-kay\"",
        "hobbies": "Fashion"
    },
    {
        "id": "jay",
        "name": "Jay",
        "gender": "M",
        "personality": "Jock",
        "species": "Bird",
        "birthday": "July 17th",
        "catchPhrase": "\"heeeeeyy\"",
        "hobbies": "Fitness"
    },
    {
        "id": "jeremiah",
        "name": "Jeremiah",
        "gender": "M",
        "personality": "Lazy",
        "species": "Frog",
        "birthday": "July 8th",
        "catchPhrase": "\"nee-deep\"",
        "hobbies": "Play"
    },
    {
        "id": "jitters",
        "name": "Jitters",
        "gender": "M",
        "personality": "Jock",
        "species": "Bird",
        "birthday": "February 2nd",
        "catchPhrase": "\"bzzert\"",
        "hobbies": "Fitness"
    },
    {
        "id": "joey",
        "name": "Joey",
        "gender": "M",
        "personality": "Lazy",
        "species": "Duck",
        "birthday": "January 3rd",
        "catchPhrase": "\"bleeeeeck\"",
        "hobbies": "Play"
    },
    {
        "id": "judy",
        "name": "Judy",
        "gender": "F",
        "personality": "Snooty",
        "species": "Cub",
        "birthday": "March 10th",
        "catchPhrase": "\"myohmy\"",
        "hobbies": "Music"
    },
    {
        "id": "julia",
        "name": "Julia",
        "gender": "F",
        "personality": "Snooty",
        "species": "Ostrich",
        "birthday": "July 31st",
        "catchPhrase": "\"dahling\"",
        "hobbies": "Education"
    },
    {
        "id": "julian",
        "name": "Julian",
        "gender": "M",
        "personality": "Smug",
        "species": "Horse",
        "birthday": "March 15th",
        "catchPhrase": "\"glitter\"",
        "hobbies": "Music"
    },
    {
        "id": "june",
        "name": "June",
        "gender": "F",
        "personality": "Normal",
        "species": "Cub",
        "birthday": "May 21st",
        "catchPhrase": "\"rainbow\"",
        "hobbies": "Nature"
    },
    {
        "id": "kabuki",
        "name": "Kabuki",
        "gender": "M",
        "personality": "Cranky",
        "species": "Cat",
        "birthday": "November 29th",
        "catchPhrase": "\"meooo-OH\"",
        "hobbies": "Music"
    },
    {
        "id": "katt",
        "name": "Katt",
        "gender": "F",
        "personality": "Sisterly",
        "species": "Cat",
        "birthday": "April 27th",
        "catchPhrase": "\"purrty\"",
        "hobbies": "Music"
    },
    {
        "id": "keaton",
        "name": "Keaton",
        "gender": "M",
        "personality": "Smug",
        "species": "Eagle",
        "birthday": "June 1st",
        "catchPhrase": "\"wingo\"",
        "hobbies": "Music"
    },
    {
        "id": "ken",
        "name": "Ken",
        "gender": "M",
        "personality": "Smug",
        "species": "Chicken",
        "birthday": "December 23rd",
        "catchPhrase": "\"no doubt\"",
        "hobbies": "Education"
    },
    {
        "id": "ketchup",
        "name": "Ketchup",
        "gender": "F",
        "personality": "Peppy",
        "species": "Duck",
        "birthday": "July 27th",
        "catchPhrase": "\"bitty\"",
        "hobbies": "Play"
    },
    {
        "id": "kevin",
        "name": "Kevin",
        "gender": "M",
        "personality": "Jock",
        "species": "Pig",
        "birthday": "April 26th",
        "catchPhrase": "\"weeweewee\"",
        "hobbies": "Play"
    },
    {
        "id": "kid_cat",
        "name": "Kid Cat",
        "gender": "M",
        "personality": "Jock",
        "species": "Cat",
        "birthday": "August 1st",
        "catchPhrase": "\"psst\"",
        "hobbies": "Fitness"
    },
    {
        "id": "kidd",
        "name": "Kidd",
        "gender": "M",
        "personality": "Smug",
        "species": "Goat",
        "birthday": "June 28th",
        "catchPhrase": "\"wut\"",
        "hobbies": "Education"
    },
    {
        "id": "kiki",
        "name": "Kiki",
        "gender": "F",
        "personality": "Normal",
        "species": "Cat",
        "birthday": "October 8th",
        "catchPhrase": "\"kitty cat\"",
        "hobbies": "Education"
    },
    {
        "id": "kitt",
        "name": "Kitt",
        "gender": "F",
        "personality": "Normal",
        "species": "Kangaroo",
        "birthday": "October 11th",
        "catchPhrase": "\"child\"",
        "hobbies": "Education"
    },
    {
        "id": "kitty",
        "name": "Kitty",
        "gender": "F",
        "personality": "Snooty",
        "species": "Cat",
        "birthday": "February 15th",
        "catchPhrase": "\"mrowrr\"",
        "hobbies": "Fashion"
    },
    {
        "id": "klaus",
        "name": "Klaus",
        "gender": "M",
        "personality": "Smug",
        "species": "Bear",
        "birthday": "March 31st",
        "catchPhrase": "\"strudel\"",
        "hobbies": "Education"
    },
    {
        "id": "knox",
        "name": "Knox",
        "gender": "M",
        "personality": "Cranky",
        "species": "Chicken",
        "birthday": "November 23rd",
        "catchPhrase": "\"cluckling\"",
        "hobbies": "Education"
    },
    {
        "id": "kody",
        "name": "Kody",
        "gender": "M",
        "personality": "Jock",
        "species": "Cub",
        "birthday": "September 28th",
        "catchPhrase": "\"grah-grah\"",
        "hobbies": "Fitness"
    },
    {
        "id": "kyle",
        "name": "Kyle",
        "gender": "M",
        "personality": "Smug",
        "species": "Wolf",
        "birthday": "December 6th",
        "catchPhrase": "\"alpha\"",
        "hobbies": "Music"
    },
    {
        "id": "leonardo",
        "name": "Leonardo",
        "gender": "M",
        "personality": "Jock",
        "species": "Tiger",
        "birthday": "May 15th",
        "catchPhrase": "\"flexin\"",
        "hobbies": "Fitness"
    },
    {
        "id": "leopold",
        "name": "Leopold",
        "gender": "M",
        "personality": "Smug",
        "species": "Lion",
        "birthday": "August 14th",
        "catchPhrase": "\"lion cub\"",
        "hobbies": "Education"
    },
    {
        "id": "lily",
        "name": "Lily",
        "gender": "F",
        "personality": "Normal",
        "species": "Frog",
        "birthday": "February 4th",
        "catchPhrase": "\"toady\"",
        "hobbies": "Education"
    },
    {
        "id": "limberg",
        "name": "Limberg",
        "gender": "M",
        "personality": "Cranky",
        "species": "Mouse",
        "birthday": "October 17th",
        "catchPhrase": "\"squinky\"",
        "hobbies": "Education"
    },
    {
        "id": "lionel",
        "name": "Lionel",
        "gender": "M",
        "personality": "Smug",
        "species": "Lion",
        "birthday": "July 29th",
        "catchPhrase": "\"precisely\"",
        "hobbies": "Music"
    },
    {
        "id": "lobo",
        "name": "Lobo",
        "gender": "M",
        "personality": "Cranky",
        "species": "Wolf",
        "birthday": "November 5th",
        "catchPhrase": "\"ah-rooooo\"",
        "hobbies": "Education"
    },
    {
        "id": "lolly",
        "name": "Lolly",
        "gender": "F",
        "personality": "Normal",
        "species": "Cat",
        "birthday": "March 27th",
        "catchPhrase": "\"bonbon\"",
        "hobbies": "Music"
    },
    {
        "id": "lopez",
        "name": "Lopez",
        "gender": "M",
        "personality": "Smug",
        "species": "Deer",
        "birthday": "August 20th",
        "catchPhrase": "\"buckaroo\"",
        "hobbies": "Education"
    },
    {
        "id": "louie",
        "name": "Louie",
        "gender": "M",
        "personality": "Jock",
        "species": "Gorilla",
        "birthday": "March 26th",
        "catchPhrase": "\"hoo hoo ha\"",
        "hobbies": "Fitness"
    },
    {
        "id": "lucha",
        "name": "Lucha",
        "gender": "M",
        "personality": "Smug",
        "species": "Bird",
        "birthday": "December 12th",
        "catchPhrase": "\"cacaw\"",
        "hobbies": "Fitness"
    },
    {
        "id": "lucky",
        "name": "Lucky",
        "gender": "M",
        "personality": "Lazy",
        "species": "Dog",
        "birthday": "November 4th",
        "catchPhrase": "\"rrr-owch\"",
        "hobbies": "Play"
    },
    {
        "id": "lucy",
        "name": "Lucy",
        "gender": "F",
        "personality": "Normal",
        "species": "Pig",
        "birthday": "June 2nd",
        "catchPhrase": "\"snoooink\"",
        "hobbies": "Music"
    },
    {
        "id": "lyman",
        "name": "Lyman",
        "gender": "M",
        "personality": "Jock",
        "species": "Koala",
        "birthday": "October 12th",
        "catchPhrase": "\"chips\"",
        "hobbies": "Play"
    },
    {
        "id": "mac",
        "name": "Mac",
        "gender": "M",
        "personality": "Jock",
        "species": "Dog",
        "birthday": "November 11th",
        "catchPhrase": "\"woo woof\"",
        "hobbies": "Fitness"
    },
    {
        "id": "maddie",
        "name": "Maddie",
        "gender": "F",
        "personality": "Peppy",
        "species": "Dog",
        "birthday": "January 11th",
        "catchPhrase": "\"yippee\"",
        "hobbies": "Fitness"
    },
    {
        "id": "maelle",
        "name": "Maelle",
        "gender": "F",
        "personality": "Snooty",
        "species": "Duck",
        "birthday": "April 8th",
        "catchPhrase": "\"duckling\"",
        "hobbies": "Fashion"
    },
    {
        "id": "maggie",
        "name": "Maggie",
        "gender": "F",
        "personality": "Normal",
        "species": "Pig",
        "birthday": "September 3rd",
        "catchPhrase": "\"schep\"",
        "hobbies": "Nature"
    },
    {
        "id": "mallary",
        "name": "Mallary",
        "gender": "F",
        "personality": "Snooty",
        "species": "Duck",
        "birthday": "November 17th",
        "catchPhrase": "\"quackpth\"",
        "hobbies": "Fashion"
    },
    {
        "id": "maple",
        "name": "Maple",
        "gender": "F",
        "personality": "Normal",
        "species": "Cub",
        "birthday": "June 15th",
        "catchPhrase": "\"honey\"",
        "hobbies": "Education"
    },
    {
        "id": "marcel",
        "name": "Marcel",
        "gender": "M",
        "personality": "Lazy",
        "species": "Dog",
        "birthday": "December 31st",
        "catchPhrase": "\"non\"",
        "hobbies": "Play"
    },
    {
        "id": "marcie",
        "name": "Marcie",
        "gender": "F",
        "personality": "Normal",
        "species": "Kangaroo",
        "birthday": "May 31st",
        "catchPhrase": "\"pouches\"",
        "hobbies": "Nature"
    },
    {
        "id": "margie",
        "name": "Margie",
        "gender": "F",
        "personality": "Normal",
        "species": "Elephant",
        "birthday": "January 28th",
        "catchPhrase": "\"tootie\"",
        "hobbies": "Education"
    },
    {
        "id": "marina",
        "name": "Marina",
        "gender": "F",
        "personality": "Normal",
        "species": "Octopus",
        "birthday": "June 26th",
        "catchPhrase": "\"blurp\"",
        "hobbies": "Music"
    },
    {
        "id": "marshal",
        "name": "Marshal",
        "gender": "M",
        "personality": "Smug",
        "species": "Squirrel",
        "birthday": "September 29th",
        "catchPhrase": "\"sulky\"",
        "hobbies": "Music"
    },
    {
        "id": "mathilda",
        "name": "Mathilda",
        "gender": "F",
        "personality": "Snooty",
        "species": "Kangaroo",
        "birthday": "November 12th",
        "catchPhrase": "\"wee baby\"",
        "hobbies": "Fitness"
    },
    {
        "id": "megan",
        "name": "Megan",
        "gender": "F",
        "personality": "Normal",
        "species": "Bear",
        "birthday": "March 13th",
        "catchPhrase": "\"sundae\"",
        "hobbies": "Nature"
    },
    {
        "id": "melba",
        "name": "Melba",
        "gender": "F",
        "personality": "Normal",
        "species": "Koala",
        "birthday": "April 12th",
        "catchPhrase": "\"toasty\"",
        "hobbies": "Education"
    },
    {
        "id": "merengue",
        "name": "Merengue",
        "gender": "F",
        "personality": "Normal",
        "species": "Rhino",
        "birthday": "March 19th",
        "catchPhrase": "\"shortcake\"",
        "hobbies": "Nature"
    },
    {
        "id": "merry",
        "name": "Merry",
        "gender": "F",
        "personality": "Peppy",
        "species": "Cat",
        "birthday": "June 29th",
        "catchPhrase": "\"mweee\"",
        "hobbies": "Fashion"
    },
    {
        "id": "midge",
        "name": "Midge",
        "gender": "F",
        "personality": "Normal",
        "species": "Bird",
        "birthday": "March 12th",
        "catchPhrase": "\"tweedledee\"",
        "hobbies": "Education"
    },
    {
        "id": "mint",
        "name": "Mint",
        "gender": "F",
        "personality": "Snooty",
        "species": "Squirrel",
        "birthday": "May 2nd",
        "catchPhrase": "\"ahhhhhh\"",
        "hobbies": "Fashion"
    },
    {
        "id": "mira",
        "name": "Mira",
        "gender": "F",
        "personality": "Sisterly",
        "species": "Rabbit",
        "birthday": "July 6th",
        "catchPhrase": "\"cottontail\"",
        "hobbies": "Fitness"
    },
    {
        "id": "miranda",
        "name": "Miranda",
        "gender": "F",
        "personality": "Snooty",
        "species": "Duck",
        "birthday": "April 23rd",
        "catchPhrase": "\"quackulous\"",
        "hobbies": "Fashion"
    },
    {
        "id": "mitzi",
        "name": "Mitzi",
        "gender": "F",
        "personality": "Normal",
        "species": "Cat",
        "birthday": "September 25th",
        "catchPhrase": "\"mew\"",
        "hobbies": "Education"
    },
    {
        "id": "moe",
        "name": "Moe",
        "gender": "M",
        "personality": "Lazy",
        "species": "Cat",
        "birthday": "January 12th",
        "catchPhrase": "\"myawn\"",
        "hobbies": "Play"
    },
    {
        "id": "molly",
        "name": "Molly",
        "gender": "F",
        "personality": "Normal",
        "species": "Duck",
        "birthday": "March 7th",
        "catchPhrase": "\"quackidee\"",
        "hobbies": "Nature"
    },
    {
        "id": "monique",
        "name": "Monique",
        "gender": "F",
        "personality": "Snooty",
        "species": "Cat",
        "birthday": "September 30th",
        "catchPhrase": "\"pffffft\"",
        "hobbies": "Fashion"
    },
    {
        "id": "monty",
        "name": "Monty",
        "gender": "M",
        "personality": "Cranky",
        "species": "Monkey",
        "birthday": "December 7th",
        "catchPhrase": "\"g'tang\"",
        "hobbies": "Education"
    },
    {
        "id": "moose",
        "name": "Moose",
        "gender": "M",
        "personality": "Jock",
        "species": "Mouse",
        "birthday": "September 13th",
        "catchPhrase": "\"shorty\"",
        "hobbies": "Fitness"
    },
    {
        "id": "mott",
        "name": "Mott",
        "gender": "M",
        "personality": "Jock",
        "species": "Lion",
        "birthday": "July 10th",
        "catchPhrase": "\"cagey\"",
        "hobbies": "Fitness"
    },
    {
        "id": "muffy",
        "name": "Muffy",
        "gender": "F",
        "personality": "Sisterly",
        "species": "Sheep",
        "birthday": "February 14th",
        "catchPhrase": "\"nightshade\"",
        "hobbies": "Music"
    },
    {
        "id": "murphy",
        "name": "Murphy",
        "gender": "M",
        "personality": "Cranky",
        "species": "Cub",
        "birthday": "December 29th",
        "catchPhrase": "\"laddie\"",
        "hobbies": "Education"
    },
    {
        "id": "nan",
        "name": "Nan",
        "gender": "F",
        "personality": "Normal",
        "species": "Goat",
        "birthday": "August 24th",
        "catchPhrase": "\"kid\"",
        "hobbies": "Nature"
    },
    {
        "id": "nana",
        "name": "Nana",
        "gender": "F",
        "personality": "Normal",
        "species": "Monkey",
        "birthday": "August 23rd",
        "catchPhrase": "\"po po\"",
        "hobbies": "Nature"
    },
    {
        "id": "naomi",
        "name": "Naomi",
        "gender": "F",
        "personality": "Snooty",
        "species": "Cow",
        "birthday": "February 28th",
        "catchPhrase": "\"moolah\"",
        "hobbies": "Fashion"
    },
    {
        "id": "nate",
        "name": "Nate",
        "gender": "M",
        "personality": "Lazy",
        "species": "Bear",
        "birthday": "August 16th",
        "catchPhrase": "\"yawwwn\"",
        "hobbies": "Play"
    },
    {
        "id": "nibbles",
        "name": "Nibbles",
        "gender": "F",
        "personality": "Peppy",
        "species": "Squirrel",
        "birthday": "July 19th",
        "catchPhrase": "\"niblet\"",
        "hobbies": "Fashion"
    },
    {
        "id": "norma",
        "name": "Norma",
        "gender": "F",
        "personality": "Normal",
        "species": "Cow",
        "birthday": "September 20th",
        "catchPhrase": "\"hoof hoo\"",
        "hobbies": "Nature"
    },
    {
        "id": "octavian",
        "name": "Octavian",
        "gender": "M",
        "personality": "Cranky",
        "species": "Octopus",
        "birthday": "September 20th",
        "catchPhrase": "\"sucker\"",
        "hobbies": "Play"
    },
    {
        "id": "o'hare",
        "name": "O'Hare",
        "gender": "M",
        "personality": "Smug",
        "species": "Rabbit",
        "birthday": "July 24th",
        "catchPhrase": "\"amigo\"",
        "hobbies": "Nature"
    },
    {
        "id": "olaf",
        "name": "Olaf",
        "gender": "M",
        "personality": "Smug",
        "species": "Anteater",
        "birthday": "May 19th",
        "catchPhrase": "\"whiffa\"",
        "hobbies": "Education"
    },
    {
        "id": "olive",
        "name": "Olive",
        "gender": "F",
        "personality": "Normal",
        "species": "Cub",
        "birthday": "July 12th",
        "catchPhrase": "\"sweet pea\"",
        "hobbies": "Nature"
    },
    {
        "id": "olivia",
        "name": "Olivia",
        "gender": "F",
        "personality": "Snooty",
        "species": "Cat",
        "birthday": "February 3rd",
        "catchPhrase": "\"purrr\"",
        "hobbies": "Music"
    },
    {
        "id": "opal",
        "name": "Opal",
        "gender": "F",
        "personality": "Snooty",
        "species": "Elephant",
        "birthday": "January 20th",
        "catchPhrase": "\"snoot\"",
        "hobbies": "Fashion"
    },
    {
        "id": "ozzie",
        "name": "Ozzie",
        "gender": "M",
        "personality": "Lazy",
        "species": "Koala",
        "birthday": "May 7th",
        "catchPhrase": "\"ol' bear\"",
        "hobbies": "Play"
    },
    {
        "id": "pancetti",
        "name": "Pancetti",
        "gender": "F",
        "personality": "Snooty",
        "species": "Pig",
        "birthday": "November 14th",
        "catchPhrase": "\"sooey\"",
        "hobbies": "Music"
    },
    {
        "id": "pango",
        "name": "Pango",
        "gender": "F",
        "personality": "Peppy",
        "species": "Anteater",
        "birthday": "November 9th",
        "catchPhrase": "\"snooooof\"",
        "hobbies": "Fashion"
    },
    {
        "id": "paolo",
        "name": "Paolo",
        "gender": "M",
        "personality": "Lazy",
        "species": "Elephant",
        "birthday": "May 5th",
        "catchPhrase": "\"pal\"",
        "hobbies": "Nature"
    },
    {
        "id": "papi",
        "name": "Papi",
        "gender": "M",
        "personality": "Lazy",
        "species": "Horse",
        "birthday": "January 10th",
        "catchPhrase": "\"haaay\"",
        "hobbies": "Nature"
    },
    {
        "id": "pashmina",
        "name": "Pashmina",
        "gender": "F",
        "personality": "Sisterly",
        "species": "Goat",
        "birthday": "December 26th",
        "catchPhrase": "\"kidders\"",
        "hobbies": "Music"
    },
    {
        "id": "pate",
        "name": "Pate",
        "gender": "F",
        "personality": "Peppy",
        "species": "Duck",
        "birthday": "February 23rd",
        "catchPhrase": "\"quackle\"",
        "hobbies": "Fashion"
    },
    {
        "id": "patty",
        "name": "Patty",
        "gender": "F",
        "personality": "Peppy",
        "species": "Cow",
        "birthday": "May 10th",
        "catchPhrase": "\"how-now\"",
        "hobbies": "Fashion"
    },
    {
        "id": "paula",
        "name": "Paula",
        "gender": "F",
        "personality": "Sisterly",
        "species": "Bear",
        "birthday": "March 22nd",
        "catchPhrase": "\"yodelay\"",
        "hobbies": "Fitness"
    },
    {
        "id": "peaches",
        "name": "Peaches",
        "gender": "F",
        "personality": "Normal",
        "species": "Horse",
        "birthday": "November 28th",
        "catchPhrase": "\"neighbor\"",
        "hobbies": "Education"
    },
    {
        "id": "peanut",
        "name": "Peanut",
        "gender": "F",
        "personality": "Peppy",
        "species": "Squirrel",
        "birthday": "June 8th",
        "catchPhrase": "\"slacker\"",
        "hobbies": "Fashion"
    },
    {
        "id": "pecan",
        "name": "Pecan",
        "gender": "F",
        "personality": "Snooty",
        "species": "Squirrel",
        "birthday": "September 10th",
        "catchPhrase": "\"chipmunk\"",
        "hobbies": "Fashion"
    },
    {
        "id": "peck",
        "name": "Peck",
        "gender": "M",
        "personality": "Jock",
        "species": "Bird",
        "birthday": "July 25th",
        "catchPhrase": "\"crunch\"",
        "hobbies": "Play"
    },
    {
        "id": "peewee",
        "name": "Peewee",
        "gender": "M",
        "personality": "Cranky",
        "species": "Gorilla",
        "birthday": "September 11th",
        "catchPhrase": "\"li'l dude\"",
        "hobbies": "Fitness"
    },
    {
        "id": "peggy",
        "name": "Peggy",
        "gender": "F",
        "personality": "Peppy",
        "species": "Pig",
        "birthday": "May 23rd",
        "catchPhrase": "\"shweetie\"",
        "hobbies": "Fashion"
    },
    {
        "id": "pekoe",
        "name": "Pekoe",
        "gender": "F",
        "personality": "Normal",
        "species": "Cub",
        "birthday": "May 18th",
        "catchPhrase": "\"bud\"",
        "hobbies": "Nature"
    },
    {
        "id": "penelope",
        "name": "Penelope",
        "gender": "F",
        "personality": "Peppy",
        "species": "Mouse",
        "birthday": "February 5th",
        "catchPhrase": "\"oh bow\"",
        "hobbies": "Fashion"
    },
    {
        "id": "phil",
        "name": "Phil",
        "gender": "M",
        "personality": "Smug",
        "species": "Ostrich",
        "birthday": "November 27th",
        "catchPhrase": "\"hurk\"",
        "hobbies": "Music"
    },
    {
        "id": "phoebe",
        "name": "Phoebe",
        "gender": "F",
        "personality": "Sisterly",
        "species": "Ostrich",
        "birthday": "April 22nd",
        "catchPhrase": "\"sparky\"",
        "hobbies": "Fitness"
    },
    {
        "id": "pierce",
        "name": "Pierce",
        "gender": "M",
        "personality": "Jock",
        "species": "Eagle",
        "birthday": "January 8th",
        "catchPhrase": "\"hawkeye\"",
        "hobbies": "Fitness"
    },
    {
        "id": "pietro",
        "name": "Pietro",
        "gender": "M",
        "personality": "Smug",
        "species": "Sheep",
        "birthday": "April 19th",
        "catchPhrase": "\"honk honk\"",
        "hobbies": "Music"
    },
    {
        "id": "pinky",
        "name": "Pinky",
        "gender": "F",
        "personality": "Peppy",
        "species": "Bear",
        "birthday": "September 9th",
        "catchPhrase": "\"wah\"",
        "hobbies": "Fashion"
    },
    {
        "id": "piper",
        "name": "Piper",
        "gender": "F",
        "personality": "Peppy",
        "species": "Bird",
        "birthday": "April 18th",
        "catchPhrase": "\"chickadee\"",
        "hobbies": "Play"
    },
    {
        "id": "pippy",
        "name": "Pippy",
        "gender": "F",
        "personality": "Peppy",
        "species": "Rabbit",
        "birthday": "June 14th",
        "catchPhrase": "\"li'l hare\"",
        "hobbies": "Fashion"
    },
    {
        "id": "plucky",
        "name": "Plucky",
        "gender": "F",
        "personality": "Sisterly",
        "species": "Chicken",
        "birthday": "October 12th",
        "catchPhrase": "\"chicky-poo\"",
        "hobbies": "Play"
    },
    {
        "id": "pompom",
        "name": "Pompom",
        "gender": "F",
        "personality": "Peppy",
        "species": "Duck",
        "birthday": "February 11th",
        "catchPhrase": "\"rah rah\"",
        "hobbies": "Music"
    },
    {
        "id": "poncho",
        "name": "Poncho",
        "gender": "M",
        "personality": "Jock",
        "species": "Cub",
        "birthday": "January 2nd",
        "catchPhrase": "\"li'l bear\"",
        "hobbies": "Fitness"
    },
    {
        "id": "poppy",
        "name": "Poppy",
        "gender": "F",
        "personality": "Normal",
        "species": "Squirrel",
        "birthday": "August 5th",
        "catchPhrase": "\"nutty\"",
        "hobbies": "Education"
    },
    {
        "id": "portia",
        "name": "Portia",
        "gender": "F",
        "personality": "Snooty",
        "species": "Dog",
        "birthday": "October 25th",
        "catchPhrase": "\"ruffian\"",
        "hobbies": "Fashion"
    },
    {
        "id": "prince",
        "name": "Prince",
        "gender": "M",
        "personality": "Lazy",
        "species": "Frog",
        "birthday": "July 21st",
        "catchPhrase": "\"burrup\"",
        "hobbies": "Play"
    },
    {
        "id": "puck",
        "name": "Puck",
        "gender": "M",
        "personality": "Lazy",
        "species": "Penguin",
        "birthday": "February 21st",
        "catchPhrase": "\"brrrrrrrrr\"",
        "hobbies": "Fitness"
    },
    {
        "id": "puddles",
        "name": "Puddles",
        "gender": "F",
        "personality": "Peppy",
        "species": "Frog",
        "birthday": "January 13th",
        "catchPhrase": "\"splish\"",
        "hobbies": "Fashion"
    },
    {
        "id": "pudge",
        "name": "Pudge",
        "gender": "M",
        "personality": "Lazy",
        "species": "Cub",
        "birthday": "June 11th",
        "catchPhrase": "\"pudgy\"",
        "hobbies": "Play"
    },
    {
        "id": "punchy",
        "name": "Punchy",
        "gender": "M",
        "personality": "Lazy",
        "species": "Cat",
        "birthday": "April 11th",
        "catchPhrase": "\"mrmpht\"",
        "hobbies": "Play"
    },
    {
        "id": "purrl",
        "name": "Purrl",
        "gender": "F",
        "personality": "Snooty",
        "species": "Cat",
        "birthday": "May 29th",
        "catchPhrase": "\"kitten\"",
        "hobbies": "Fashion"
    },
    {
        "id": "queenie",
        "name": "Queenie",
        "gender": "F",
        "personality": "Snooty",
        "species": "Ostrich",
        "birthday": "November 13th",
        "catchPhrase": "\"chicken\"",
        "hobbies": "Fashion"
    },
    {
        "id": "quillson",
        "name": "Quillson",
        "gender": "M",
        "personality": "Smug",
        "species": "Duck",
        "birthday": "December 22nd",
        "catchPhrase": "\"ridukulous\"",
        "hobbies": "Music"
    },
    {
        "id": "raddle",
        "name": "Raddle",
        "gender": "M",
        "personality": "Lazy",
        "species": "Frog",
        "birthday": "June 6th",
        "catchPhrase": "\"aaach-\"",
        "hobbies": "Nature"
    },
    {
        "id": "rasher",
        "name": "Rasher",
        "gender": "M",
        "personality": "Cranky",
        "species": "Pig",
        "birthday": "April 7th",
        "catchPhrase": "\"swine\"",
        "hobbies": "Music"
    },
    {
        "id": "raymond",
        "name": "Raymond",
        "gender": "M",
        "personality": "Smug",
        "species": "Cat",
        "birthday": "October 1st",
        "catchPhrase": "\"crisp\"",
        "hobbies": "Nature"
    },
    {
        "id": "renee",
        "name": "Renée",
        "gender": "F",
        "personality": "Sisterly",
        "species": "Rhino",
        "birthday": "May 28th",
        "catchPhrase": "\"yo yo yo\"",
        "hobbies": "Music"
    },
    {
        "id": "reneigh",
        "name": "Reneigh",
        "gender": "F",
        "personality": "Sisterly",
        "species": "Horse",
        "birthday": "June 4th",
        "catchPhrase": "\"ayup, yup\"",
        "hobbies": "Play"
    },
    {
        "id": "rex",
        "name": "Rex",
        "gender": "M",
        "personality": "Lazy",
        "species": "Lion",
        "birthday": "July 24th",
        "catchPhrase": "\"cool cat\"",
        "hobbies": "Nature"
    },
    {
        "id": "rhonda",
        "name": "Rhonda",
        "gender": "F",
        "personality": "Normal",
        "species": "Rhino",
        "birthday": "January 24th",
        "catchPhrase": "\"bigfoot\"",
        "hobbies": "Music"
    },
    {
        "id": "ribbot",
        "name": "Ribbot",
        "gender": "M",
        "personality": "Jock",
        "species": "Frog",
        "birthday": "February 13th",
        "catchPhrase": "\"zzrrbbitt\"",
        "hobbies": "Fitness"
    },
    {
        "id": "ricky",
        "name": "Ricky",
        "gender": "M",
        "personality": "Cranky",
        "species": "Squirrel",
        "birthday": "September 14th",
        "catchPhrase": "\"nutcase\"",
        "hobbies": "Education"
    },
    {
        "id": "rizzo",
        "name": "Rizzo",
        "gender": "M",
        "personality": "Cranky",
        "species": "Mouse",
        "birthday": "January 17th",
        "catchPhrase": "\"squee\"",
        "hobbies": "Education"
    },
    {
        "id": "roald",
        "name": "Roald",
        "gender": "M",
        "personality": "Jock",
        "species": "Penguin",
        "birthday": "January 5th",
        "catchPhrase": "\"b-b-buddy\"",
        "hobbies": "Fitness"
    },
    {
        "id": "robin",
        "name": "Robin",
        "gender": "F",
        "personality": "Snooty",
        "species": "Bird",
        "birthday": "December 4th",
        "catchPhrase": "\"la-di-da\"",
        "hobbies": "Fashion"
    },
    {
        "id": "rocco",
        "name": "Rocco",
        "gender": "M",
        "personality": "Cranky",
        "species": "Hippo",
        "birthday": "August 18th",
        "catchPhrase": "\"hippie\"",
        "hobbies": "Education"
    },
    {
        "id": "rocket",
        "name": "Rocket",
        "gender": "F",
        "personality": "Sisterly",
        "species": "Gorilla",
        "birthday": "April 14th",
        "catchPhrase": "\"vroom\"",
        "hobbies": "Fitness"
    },
    {
        "id": "rod",
        "name": "Rod",
        "gender": "M",
        "personality": "Jock",
        "species": "Mouse",
        "birthday": "August 14th",
        "catchPhrase": "\"ace\"",
        "hobbies": "Fitness"
    },
    {
        "id": "rodeo",
        "name": "Rodeo",
        "gender": "M",
        "personality": "Lazy",
        "species": "Bull",
        "birthday": "October 29th",
        "catchPhrase": "\"chaps\"",
        "hobbies": "Fitness"
    },
    {
        "id": "rodney",
        "name": "Rodney",
        "gender": "M",
        "personality": "Smug",
        "species": "Hamster",
        "birthday": "November 10th",
        "catchPhrase": "\"le ham\"",
        "hobbies": "Music"
    },
    {
        "id": "rolf",
        "name": "Rolf",
        "gender": "M",
        "personality": "Cranky",
        "species": "Tiger",
        "birthday": "August 22nd",
        "catchPhrase": "\"grrrolf\"",
        "hobbies": "Fitness"
    },
    {
        "id": "rooney",
        "name": "Rooney",
        "gender": "M",
        "personality": "Cranky",
        "species": "Kangaroo",
        "birthday": "December 1st",
        "catchPhrase": "\"punches\"",
        "hobbies": "Fitness"
    },
    {
        "id": "rory",
        "name": "Rory",
        "gender": "M",
        "personality": "Jock",
        "species": "Lion",
        "birthday": "August 7th",
        "catchPhrase": "\"capital\"",
        "hobbies": "Music"
    },
    {
        "id": "roscoe",
        "name": "Roscoe",
        "gender": "M",
        "personality": "Cranky",
        "species": "Horse",
        "birthday": "June 16th",
        "catchPhrase": "\"nay\"",
        "hobbies": "Music"
    },
    {
        "id": "rosie",
        "name": "Rosie",
        "gender": "F",
        "personality": "Peppy",
        "species": "Cat",
        "birthday": "February 27th",
        "catchPhrase": "\"silly\"",
        "hobbies": "Music"
    },
    {
        "id": "rowan",
        "name": "Rowan",
        "gender": "M",
        "personality": "Jock",
        "species": "Tiger",
        "birthday": "August 26th",
        "catchPhrase": "\"mango\"",
        "hobbies": "Fitness"
    },
    {
        "id": "ruby",
        "name": "Ruby",
        "gender": "F",
        "personality": "Peppy",
        "species": "Rabbit",
        "birthday": "December 25th",
        "catchPhrase": "\"li'l ears\"",
        "hobbies": "Nature"
    },
    {
        "id": "rudy",
        "name": "Rudy",
        "gender": "M",
        "personality": "Jock",
        "species": "Cat",
        "birthday": "December 20th",
        "catchPhrase": "\"mush\"",
        "hobbies": "Play"
    },
    {
        "id": "sally",
        "name": "Sally",
        "gender": "F",
        "personality": "Normal",
        "species": "Squirrel",
        "birthday": "June 19th",
        "catchPhrase": "\"nutmeg\"",
        "hobbies": "Music"
    },
    {
        "id": "samson",
        "name": "Samson",
        "gender": "M",
        "personality": "Jock",
        "species": "Mouse",
        "birthday": "July 5th",
        "catchPhrase": "\"pipsqueak\"",
        "hobbies": "Fitness"
    },
    {
        "id": "sandy",
        "name": "Sandy",
        "gender": "F",
        "personality": "Normal",
        "species": "Ostrich",
        "birthday": "October 21st",
        "catchPhrase": "\"speedy\"",
        "hobbies": "Nature"
    },
    {
        "id": "savannah",
        "name": "Savannah",
        "gender": "F",
        "personality": "Normal",
        "species": "Horse",
        "birthday": "January 25th",
        "catchPhrase": "\"y'all\"",
        "hobbies": "Music"
    },
    {
        "id": "scoot",
        "name": "Scoot",
        "gender": "M",
        "personality": "Jock",
        "species": "Duck",
        "birthday": "June 13th",
        "catchPhrase": "\"zip zoom\"",
        "hobbies": "Fitness"
    },
    {
        "id": "shari",
        "name": "Shari",
        "gender": "F",
        "personality": "Sisterly",
        "species": "Monkey",
        "birthday": "April 10th",
        "catchPhrase": "\"cheeky\"",
        "hobbies": "Music"
    },
    {
        "id": "sheldon",
        "name": "Sheldon",
        "gender": "M",
        "personality": "Jock",
        "species": "Squirrel",
        "birthday": "February 26th",
        "catchPhrase": "\"cardio\"",
        "hobbies": "Play"
    },
    {
        "id": "shep",
        "name": "Shep",
        "gender": "M",
        "personality": "Smug",
        "species": "Dog",
        "birthday": "November 24th",
        "catchPhrase": "\"baa baa baa\"",
        "hobbies": "Education"
    },
    {
        "id": "sherb",
        "name": "Sherb",
        "gender": "M",
        "personality": "Lazy",
        "species": "Goat",
        "birthday": "January 18th",
        "catchPhrase": "\"bawwww\"",
        "hobbies": "Nature"
    },
    {
        "id": "simon",
        "name": "Simon",
        "gender": "M",
        "personality": "Lazy",
        "species": "Monkey",
        "birthday": "January 19th",
        "catchPhrase": "\"zzzook\"",
        "hobbies": "Play"
    },
    {
        "id": "skye",
        "name": "Skye",
        "gender": "F",
        "personality": "Normal",
        "species": "Wolf",
        "birthday": "March 24th",
        "catchPhrase": "\"airmail\"",
        "hobbies": "Music"
    },
    {
        "id": "sly",
        "name": "Sly",
        "gender": "M",
        "personality": "Jock",
        "species": "Alligator",
        "birthday": "November 15th",
        "catchPhrase": "\"hoo-rah\"",
        "hobbies": "Play"
    },
    {
        "id": "snake",
        "name": "Snake",
        "gender": "M",
        "personality": "Jock",
        "species": "Rabbit",
        "birthday": "November 3rd",
        "catchPhrase": "\"bunyip\"",
        "hobbies": "Fitness"
    },
    {
        "id": "snooty",
        "name": "Snooty",
        "gender": "F",
        "personality": "Snooty",
        "species": "Anteater",
        "birthday": "August 24th",
        "catchPhrase": "\"snifffff\"",
        "hobbies": "Education"
    },
    {
        "id": "soleil",
        "name": "Soleil",
        "gender": "F",
        "personality": "Snooty",
        "species": "Hamster",
        "birthday": "August 9th",
        "catchPhrase": "\"tarnation\"",
        "hobbies": "Education"
    },
    {
        "id": "sparro",
        "name": "Sparro",
        "gender": "M",
        "personality": "Jock",
        "species": "Bird",
        "birthday": "November 20th",
        "catchPhrase": "\"like whoa\"",
        "hobbies": "Play"
    },
    {
        "id": "spike",
        "name": "Spike",
        "gender": "M",
        "personality": "Cranky",
        "species": "Rhino",
        "birthday": "June 17th",
        "catchPhrase": "\"punk\"",
        "hobbies": "Nature"
    },
    {
        "id": "spork",
        "name": "Spork",
        "gender": "M",
        "personality": "Lazy",
        "species": "Pig",
        "birthday": "September 3rd",
        "catchPhrase": "\"snork\"",
        "hobbies": "Play"
    },
    {
        "id": "sprinkle",
        "name": "Sprinkle",
        "gender": "F",
        "personality": "Peppy",
        "species": "Penguin",
        "birthday": "February 20th",
        "catchPhrase": "\"frappe\"",
        "hobbies": "Play"
    },
    {
        "id": "sprocket",
        "name": "Sprocket",
        "gender": "M",
        "personality": "Jock",
        "species": "Ostrich",
        "birthday": "December 1st",
        "catchPhrase": "\"zort\"",
        "hobbies": "Music"
    },
    {
        "id": "static",
        "name": "Static",
        "gender": "M",
        "personality": "Cranky",
        "species": "Squirrel",
        "birthday": "July 9th",
        "catchPhrase": "\"krzzt\"",
        "hobbies": "Music"
    },
    {
        "id": "stella",
        "name": "Stella",
        "gender": "F",
        "personality": "Normal",
        "species": "Sheep",
        "birthday": "April 9th",
        "catchPhrase": "\"baa-dabing\"",
        "hobbies": "Nature"
    },
    {
        "id": "sterling",
        "name": "Sterling",
        "gender": "M",
        "personality": "Jock",
        "species": "Eagle",
        "birthday": "December 11th",
        "catchPhrase": "\"skraaaaw\"",
        "hobbies": "Fitness"
    },
    {
        "id": "stinky",
        "name": "Stinky",
        "gender": "M",
        "personality": "Jock",
        "species": "Cat",
        "birthday": "August 17th",
        "catchPhrase": "\"GAHHHH\"",
        "hobbies": "Fitness"
    },
    {
        "id": "stitches",
        "name": "Stitches",
        "gender": "M",
        "personality": "Lazy",
        "species": "Cub",
        "birthday": "February 10th",
        "catchPhrase": "\"stuffin'\"",
        "hobbies": "Play"
    },
    {
        "id": "stu",
        "name": "Stu",
        "gender": "M",
        "personality": "Lazy",
        "species": "Bull",
        "birthday": "April 20th",
        "catchPhrase": "\"moo-dude\"",
        "hobbies": "Nature"
    },
    {
        "id": "sydney",
        "name": "Sydney",
        "gender": "F",
        "personality": "Normal",
        "species": "Koala",
        "birthday": "June 21st",
        "catchPhrase": "\"sunshine\"",
        "hobbies": "Music"
    },
    {
        "id": "sylvana",
        "name": "Sylvana",
        "gender": "F",
        "personality": "Normal",
        "species": "Squirrel",
        "birthday": "October 22nd",
        "catchPhrase": "\"hubbub\"",
        "hobbies": "Nature"
    },
    {
        "id": "sylvia",
        "name": "Sylvia",
        "gender": "F",
        "personality": "Sisterly",
        "species": "Kangaroo",
        "birthday": "May 3rd",
        "catchPhrase": "\"boing\"",
        "hobbies": "Music"
    },
    {
        "id": "tabby",
        "name": "Tabby",
        "gender": "F",
        "personality": "Peppy",
        "species": "Cat",
        "birthday": "August 13th",
        "catchPhrase": "\"me-WOW\"",
        "hobbies": "Music"
    },
    {
        "id": "tad",
        "name": "Tad",
        "gender": "M",
        "personality": "Jock",
        "species": "Frog",
        "birthday": "August 3rd",
        "catchPhrase": "\"sluuuurp\"",
        "hobbies": "Play"
    },
    {
        "id": "tammi",
        "name": "Tammi",
        "gender": "F",
        "personality": "Peppy",
        "species": "Monkey",
        "birthday": "April 2nd",
        "catchPhrase": "\"chimpy\"",
        "hobbies": "Fashion"
    },
    {
        "id": "tammy",
        "name": "Tammy",
        "gender": "F",
        "personality": "Sisterly",
        "species": "Cub",
        "birthday": "June 23rd",
        "catchPhrase": "\"ya heard\"",
        "hobbies": "Play"
    },
    {
        "id": "tangy",
        "name": "Tangy",
        "gender": "F",
        "personality": "Peppy",
        "species": "Cat",
        "birthday": "June 17th",
        "catchPhrase": "\"reeeeOWR\"",
        "hobbies": "Music"
    },
    {
        "id": "tank",
        "name": "Tank",
        "gender": "M",
        "personality": "Jock",
        "species": "Rhino",
        "birthday": "May 6th",
        "catchPhrase": "\"kerPOW\"",
        "hobbies": "Fitness"
    },
    {
        "id": "tasha",
        "name": "Tasha",
        "gender": "F",
        "personality": "Snooty",
        "species": "Squirrel",
        "birthday": "November 30th",
        "catchPhrase": "\"nice nice\"",
        "hobbies": "Fitness"
    },
    {
        "id": "t-bone",
        "name": "T-Bone",
        "gender": "M",
        "personality": "Cranky",
        "species": "Bull",
        "birthday": "May 20th",
        "catchPhrase": "\"moocher\"",
        "hobbies": "Education"
    },
    {
        "id": "teddy",
        "name": "Teddy",
        "gender": "M",
        "personality": "Jock",
        "species": "Bear",
        "birthday": "September 26th",
        "catchPhrase": "\"grooof\"",
        "hobbies": "Fitness"
    },
    {
        "id": "tex",
        "name": "Tex",
        "gender": "M",
        "personality": "Smug",
        "species": "Penguin",
        "birthday": "October 6th",
        "catchPhrase": "\"picante\"",
        "hobbies": "Music"
    },
    {
        "id": "tia",
        "name": "Tia",
        "gender": "F",
        "personality": "Normal",
        "species": "Elephant",
        "birthday": "November 18th",
        "catchPhrase": "\"teacup\"",
        "hobbies": "Nature"
    },
    {
        "id": "tiffany",
        "name": "Tiffany",
        "gender": "F",
        "personality": "Snooty",
        "species": "Rabbit",
        "birthday": "January 9th",
        "catchPhrase": "\"bun bun\"",
        "hobbies": "Fashion"
    },
    {
        "id": "timbra",
        "name": "Timbra",
        "gender": "F",
        "personality": "Snooty",
        "species": "Sheep",
        "birthday": "October 21st",
        "catchPhrase": "\"pine nut\"",
        "hobbies": "Education"
    },
    {
        "id": "tipper",
        "name": "Tipper",
        "gender": "F",
        "personality": "Snooty",
        "species": "Cow",
        "birthday": "August 25th",
        "catchPhrase": "\"pushy\"",
        "hobbies": "Fashion"
    },
    {
        "id": "tom",
        "name": "Tom",
        "gender": "M",
        "personality": "Cranky",
        "species": "Cat",
        "birthday": "December 10th",
        "catchPhrase": "\"me-YOWZA\"",
        "hobbies": "Education"
    },
    {
        "id": "truffles",
        "name": "Truffles",
        "gender": "F",
        "personality": "Peppy",
        "species": "Pig",
        "birthday": "July 28th",
        "catchPhrase": "\"snoutie\"",
        "hobbies": "Fashion"
    },
    {
        "id": "tucker",
        "name": "Tucker",
        "gender": "M",
        "personality": "Lazy",
        "species": "Elephant",
        "birthday": "September 7th",
        "catchPhrase": "\"fuzzers\"",
        "hobbies": "Nature"
    },
    {
        "id": "tutu",
        "name": "Tutu",
        "gender": "F",
        "personality": "Peppy",
        "species": "Bear",
        "birthday": "November 15th",
        "catchPhrase": "\"twinkles\"",
        "hobbies": "Fashion"
    },
    {
        "id": "twiggy",
        "name": "Twiggy",
        "gender": "F",
        "personality": "Peppy",
        "species": "Bird",
        "birthday": "July 13th",
        "catchPhrase": "\"cheepers\"",
        "hobbies": "Fashion"
    },
    {
        "id": "tybalt",
        "name": "Tybalt",
        "gender": "M",
        "personality": "Jock",
        "species": "Tiger",
        "birthday": "August 19th",
        "catchPhrase": "\"grrRAH\"",
        "hobbies": "Play"
    },
    {
        "id": "ursala",
        "name": "Ursala",
        "gender": "F",
        "personality": "Sisterly",
        "species": "Bear",
        "birthday": "January 16th",
        "catchPhrase": "\"grooomph\"",
        "hobbies": "Music"
    },
    {
        "id": "velma",
        "name": "Velma",
        "gender": "F",
        "personality": "Snooty",
        "species": "Goat",
        "birthday": "January 14th",
        "catchPhrase": "\"blih\"",
        "hobbies": "Education"
    },
    {
        "id": "vesta",
        "name": "Vesta",
        "gender": "F",
        "personality": "Normal",
        "species": "Sheep",
        "birthday": "April 16th",
        "catchPhrase": "\"baaaffo\"",
        "hobbies": "Fashion"
    },
    {
        "id": "vic",
        "name": "Vic",
        "gender": "M",
        "personality": "Cranky",
        "species": "Bull",
        "birthday": "December 29th",
        "catchPhrase": "\"cud\"",
        "hobbies": "Fitness"
    },
    {
        "id": "victoria",
        "name": "Victoria",
        "gender": "F",
        "personality": "Peppy",
        "species": "Horse",
        "birthday": "July 11th",
        "catchPhrase": "\"sugar cube\"",
        "hobbies": "Fitness"
    },
    {
        "id": "violet",
        "name": "Violet",
        "gender": "F",
        "personality": "Snooty",
        "species": "Gorilla",
        "birthday": "September 1st",
        "catchPhrase": "\"sweetie\"",
        "hobbies": "Fitness"
    },
    {
        "id": "vivian",
        "name": "Vivian",
        "gender": "F",
        "personality": "Snooty",
        "species": "Wolf",
        "birthday": "January 26th",
        "catchPhrase": "\"piffle\"",
        "hobbies": "Education"
    },
    {
        "id": "vladimir",
        "name": "Vladimir",
        "gender": "M",
        "personality": "Cranky",
        "species": "Cub",
        "birthday": "August 2nd",
        "catchPhrase": "\"nyet\"",
        "hobbies": "Play"
    },
    {
        "id": "wade",
        "name": "Wade",
        "gender": "M",
        "personality": "Lazy",
        "species": "Penguin",
        "birthday": "October 30th",
        "catchPhrase": "\"so it goes\"",
        "hobbies": "Nature"
    },
    {
        "id": "walker",
        "name": "Walker",
        "gender": "M",
        "personality": "Lazy",
        "species": "Dog",
        "birthday": "June 10th",
        "catchPhrase": "\"wuh\"",
        "hobbies": "Play"
    },
    {
        "id": "walt",
        "name": "Walt",
        "gender": "M",
        "personality": "Cranky",
        "species": "Kangaroo",
        "birthday": "April 24th",
        "catchPhrase": "\"pockets\"",
        "hobbies": "Fitness"
    },
    {
        "id": "wart_jr.",
        "name": "Wart Jr.",
        "gender": "M",
        "personality": "Cranky",
        "species": "Frog",
        "birthday": "August 21st",
        "catchPhrase": "\"grr-ribbit\"",
        "hobbies": "Education"
    },
    {
        "id": "weber",
        "name": "Weber",
        "gender": "M",
        "personality": "Lazy",
        "species": "Duck",
        "birthday": "June 30th",
        "catchPhrase": "\"quaa\"",
        "hobbies": "Nature"
    },
    {
        "id": "wendy",
        "name": "Wendy",
        "gender": "F",
        "personality": "Peppy",
        "species": "Sheep",
        "birthday": "August 15th",
        "catchPhrase": "\"lambkins\"",
        "hobbies": "Fashion"
    },
    {
        "id": "whitney",
        "name": "Whitney",
        "gender": "F",
        "personality": "Snooty",
        "species": "Wolf",
        "birthday": "September 17th",
        "catchPhrase": "\"snappy\"",
        "hobbies": "Fashion"
    },
    {
        "id": "willow",
        "name": "Willow",
        "gender": "F",
        "personality": "Snooty",
        "species": "Sheep",
        "birthday": "November 26th",
        "catchPhrase": "\"bo peep\"",
        "hobbies": "Fashion"
    },
    {
        "id": "winnie",
        "name": "Winnie",
        "gender": "F",
        "personality": "Peppy",
        "species": "Horse",
        "birthday": "January 31st",
        "catchPhrase": "\"hay-OK\"",
        "hobbies": "Fashion"
    },
    {
        "id": "wolfgang",
        "name": "Wolfgang",
        "gender": "M",
        "personality": "Cranky",
        "species": "Wolf",
        "birthday": "November 25th",
        "catchPhrase": "\"snarrrl\"",
        "hobbies": "Education"
    },
    {
        "id": "yuka",
        "name": "Yuka",
        "gender": "F",
        "personality": "Snooty",
        "species": "Koala",
        "birthday": "July 20th",
        "catchPhrase": "\"tsk tsk\"",
        "hobbies": "Fashion"
    },
    {
        "id": "zell",
        "name": "Zell",
        "gender": "M",
        "personality": "Smug",
        "species": "Deer",
        "birthday": "June 7th",
        "catchPhrase": "\"pronk\"",
        "hobbies": "Music"
    },
    {
        "id": "zucker",
        "name": "Zucker",
        "gender": "M",
        "personality": "Lazy",
        "species": "Octopus",
        "birthday": "March 8th",
        "catchPhrase": "\"bloop\"",
        "hobbies": "Nature"
    }
];

module.exports = villagers;
