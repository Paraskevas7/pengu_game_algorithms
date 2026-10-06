/* All lesson text, written for students aged 7 to 15. English here, Greek in content-el.js.
   Content.bfs, Content.ui ... always give the text in the current language. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory(require('./i18n.js'));
  else root.Content = factory(root.I18n);
})(typeof self !== 'undefined' ? self : this, function (I18n) {
  'use strict';

  var EN = {
    ui: {
      storyTitle: 'The story in pictures',
      storyHint: 'Six snapshots of the algorithm. Press play above to watch it move.',
      howTitle: 'How it works',
      rememberTitle: 'Remember',
      timeTitle: 'How fast is it?',
      usedTitle: 'Where do people use it?',
      watchTitle: 'Careful!',
      codeTitle: 'For big kids: pseudocode',
      codeHint: 'Pseudocode is a recipe written in plain words. Computers need it in a special language, but the idea is the same.',
      examples: 'Try another example',
      numbersLabel: 'Or type your own numbers (1 to 9, no repeats):',
      numbersButton: 'Show me',
      quizTitle: 'Practice: what happens next?',
      quizHint: 'Look at the picture and choose the right answer. Take your time!'
    },

    bits: {
      title: 'Binary Numbers',
      short: 'Binary numbers',
      tag: 'How a computer writes numbers with only on and off',
      goal: 'Write a number using only 1s and 0s, the way a computer does, by turning switches on and off.',
      story: [
        'Inside a computer there are millions of tiny switches. A switch can only be ON or OFF, so a computer writes everything with just two symbols: 1 (on) and 0 (off). This is called binary.',
        'We use a row of switches. Each one is worth a different amount: 8, 4, 2 and 1. Every switch is worth double the one next to it. To make a number, we turn on the switches whose values add up to it.',
        'Start with the biggest switch. If its value fits into the number you still need, turn it on and subtract it. If not, leave it off. Then go to the next switch.'
      ],
      steps: [
        'Write down the number you want to make.',
        'Start with the biggest switch (8).',
        'If its value fits into what is left, turn it on (1) and subtract its value.',
        'If it does not fit, leave it off (0).',
        'Move to the next smaller switch. At the end, the row of 1s and 0s is your number.'
      ],
      remember: 'Binary uses only 1 and 0. Every switch is worth double the one to its right: 1, 2, 4, 8, 16 and so on.',
      time: { formula: 'Switches = log₂(n)', text: 'A number n needs only about log₂(n) switches. With 10 switches you can already make every number up to 1023, and with 20 switches more than a million.' },
      used: 'Everything in a computer: numbers, letters, pictures, music and games are all stored as 1s and 0s.',
      watch: 'In binary, 10 does not mean ten. It means one 2 and no 1s, so it is two. Always check the values of the switches.',
      pseudoNote: ''
    },

    loop: {
      title: 'Loops',
      short: 'Loops',
      tag: 'Make the computer do the same job again and again',
      goal: 'Use a loop to add up the numbers from 1 to n, one round at a time.',
      story: [
        'Imagine you must hop across 100 stepping stones. You would not write 100 separate instructions! You would say: "Repeat 100 times: hop to the next stone." That is a loop.',
        'A loop has a counter. It starts at 1, and every round it goes up by one. In each round the computer does the same job, using the current number.',
        'Our job here: add the counter to a total. Round 1 adds 1, round 2 adds 2, and so on. When the counter reaches the end, the loop stops and the total is ready.'
      ],
      steps: [
        'Start the total at 0.',
        'Start the counter at 1.',
        'Do the job: add the counter to the total.',
        'Move the counter up by one.',
        'Repeat until the counter passes the last number. The total is the answer.'
      ],
      remember: 'A loop repeats the same instructions, and a counter tells the computer when to stop.',
      time: { formula: 'Time = n', text: 'If the loop repeats n times, the work grows in step with n: twice as many rounds takes twice as long.' },
      used: 'Almost every program! Drawing every pixel on the screen, checking every message, moving every enemy in a game.',
      watch: 'If a loop never reaches its stopping point, it repeats forever. Programmers call this an infinite loop, and it makes programs freeze.',
      pseudoNote: ''
    },

    vars: {
      title: 'Variables',
      short: 'Variables',
      tag: 'Boxes with names that hold numbers',
      goal: 'Follow a small program line by line and always know what is inside each box.',
      story: [
        'A variable is a box with a name on it. Inside the box there is a value, like a number. The computer uses the name to find the box.',
        'A line like fish = 3 means: put 3 in the box called fish. A line like fish = fish + 2 means: look inside fish, add 2, and put the answer back in the same box. The old number is gone, replaced by the new one!',
        'A line like friend = fish copies the number into another box. Changing fish later does not change friend, because friend has its own copy.'
      ],
      steps: [
        'Read one line at a time, from the top.',
        'Work out the right side of the = sign first.',
        'Put the answer in the box named on the left side.',
        'The old value in that box disappears.',
        'Other boxes do not change unless a line tells them to.'
      ],
      remember: 'The = sign in code means "put the answer into this box", not "is equal to". Work out the right side first.',
      time: { formula: 'Time = 1 step per line', text: 'The computer follows one line at a time, and each line takes one step. Longer programs just have more lines.' },
      used: 'Scores in games, the number of lives left, the name you type in a form: everything a program remembers lives in variables.',
      watch: 'Swapping two boxes needs a third, spare box. If you just copy a into b, the old value of b is lost. Try the "Swap two boxes" example!',
      pseudoNote: ''
    },

    cond: {
      title: 'If and Else',
      short: 'If and else',
      tag: 'Teach the computer to make decisions',
      goal: 'Follow a program that asks true-or-false questions and chooses what to do.',
      story: [
        'Every day you decide things: if it is cold, you wear a hat, otherwise you do not. A computer decides in the same way, with a rule that starts with the word IF.',
        'The computer asks a question that can only be true or false, like "is the temperature smaller than 0?". If the answer is true, it does the job under that question. If it is false, it moves on to the next question.',
        'At the end there is an ELSE part. It runs when every question above it was false. Only one branch is ever chosen, so the computer never does two things by mistake.'
      ],
      steps: [
        'Look at the value, for example the temperature.',
        'Ask the first question. Is it true?',
        'If it is true, do that job and skip all the other branches.',
        'If it is false, ask the next question.',
        'If every question was false, do the ELSE job.'
      ],
      remember: 'IF asks a true-or-false question. The first true branch wins, and ELSE catches everything else.',
      time: { formula: 'Time = a few questions', text: 'The computer asks at most one question per branch, so deciding is extremely fast, even if the program has many branches.' },
      used: 'Everywhere! A game checking if you won, a phone checking your password, a traffic light checking which colour is next.',
      watch: 'The order of the questions matters. If you ask "temp < 10" before "temp < 0", the scarf branch would never be reached. Also remember that "smaller than 10" is not true for 10 itself.',
      pseudoNote: 'The indented lines belong to the question above them.'
    },

    bug: {
      title: 'Find the Bug',
      short: 'Find the bug',
      tag: 'Spot the mistake hiding in a program',
      goal: 'Run a program by hand, notice that the answer is wrong, and find the broken line.',
      story: [
        'A bug is a mistake in a program. The computer does exactly what the lines say, even when the lines are wrong. That is why programs that look fine can give the wrong answer.',
        'Finding a bug is detective work. First, decide what the answer should be. Then run the program one line at a time and write down what each box holds.',
        'When a box does not hold what you expected, you are close to the bug. Look at the line that changed it. Programmers call this debugging, and they do it every single day.'
      ],
      steps: [
        'Work out what the correct answer should be.',
        'Run the program one line at a time.',
        'Write down the boxes after every line.',
        'Compare the final boxes with the correct answer.',
        'Find the first line where things went wrong, fix it and run the program again.'
      ],
      remember: 'A bug is a mistake in a program. Run it line by line and compare with what you wanted to find it.',
      time: { formula: 'Time = lines to check', text: 'In the worst case you check every line once, so a program that is twice as long can take twice as long to debug.' },
      used: 'All software has bugs, even the apps on your phone. Testers and programmers spend a large part of their time hunting them.',
      watch: 'Do not guess! Do not change lines randomly. Run the program step by step and let the boxes show you where the mistake is.',
      pseudoNote: 'The program shown is the one with the bug.'
    },

    race: {
      title: 'Speed of Algorithms',
      short: 'Speed race',
      tag: 'See which method slows down on big piles',
      goal: 'Watch three penguins race and discover how the number of steps grows when the pile gets bigger.',
      story: [
        'Two programs can solve the same problem, but one can be much faster. Computer scientists compare them by counting steps as the amount of data, called n, gets bigger.',
        'The Walker checks every item once: n steps. The Waddler compares every item with every other item: n × n steps. The Slider cuts the pile in half again and again, like binary search: about log₂ n steps.',
        'On a small pile all three are quick. On a big pile the Waddler needs millions of steps while the Slider needs only a few. Choosing the right algorithm can turn hours into a blink.'
      ],
      steps: [
        'Pick a size n for the pile.',
        'Count the steps the Walker needs: n.',
        'Count the steps the Waddler needs: n × n.',
        'Count the steps the Slider needs: how many times can you halve n?',
        'Make n bigger and see whose steps grow fastest.'
      ],
      remember: 'What matters is how fast the steps grow when n grows. log₂ n grows slowest, n grows in step with n, and n × n explodes.',
      time: { formula: 'log₂ n  <  n  <  n × n', text: 'This is called Big O thinking. Doubling n adds one step for the Slider, doubles the Walker, and makes the Waddler four times slower.' },
      used: 'Choosing how to search or sort millions of items, ranking web pages, and any app that has to stay fast when many people use it.',
      watch: 'A fast method is not always the best for small piles. The difference only becomes huge when n is big, so test with big numbers too.',
      pseudoNote: 'The three penguins stand for three different ways of solving the same problem.'
    },

    cipher: {
      title: 'Secret Messages',
      short: 'Secret messages',
      tag: 'Hide a message with a Caesar code',
      goal: 'Turn a word into a secret code by moving each letter along the alphabet, and learn why secrets need to be strong.',
      story: [
        'People have hidden messages for thousands of years. Julius Caesar is said to have moved every letter of his messages forward by a few places, so only a friend who knew the shift could read them.',
        'With a shift of 3, A becomes D, B becomes E and C becomes F. When the alphabet runs out after Z, it starts again at A. So X becomes A.',
        'To read the message, your friend shifts every letter backward by the same number. The shift is the secret key. Today computers use much stronger keys, because this code only has 25 possible shifts and someone could try them all in seconds.'
      ],
      steps: [
        'Choose the shift, for example 3.',
        'Take the first letter of the message.',
        'Move it forward along the alphabet by the shift.',
        'If you pass Z, continue from A.',
        'Write the new letter and repeat for every letter.'
      ],
      remember: 'A cipher hides a message with a secret key. Longer and less guessable keys, like strong passwords, are much harder to crack.',
      time: { formula: 'Time = number of letters', text: 'The computer moves each letter once, so a message twice as long takes twice as long. Breaking this code is easy because there are only 25 shifts to try.' },
      used: 'Modern secrets on the internet, like passwords and private messages, use much stronger codes. The idea of a key stays the same.',
      watch: 'Never use this code for real secrets. Use long passwords that are hard to guess, never share them, and never use the same password everywhere.',
      pseudoNote: ''
    },

    rep: {
      title: 'Letters and Pictures as Numbers',
      short: 'Data as numbers',
      tag: 'How letters and pictures become numbers',
      goal: 'See how a computer stores a word and a picture using nothing but numbers.',
      story: [
        'A computer only understands numbers. So how does it store a word? It gives every letter a number. A is 1, B is 2, C is 3, and so on. The word ICE is stored as 9, 3, 5.',
        'Then each number is written in binary, with switches that are on or off. That is why the lesson on binary numbers matters: every letter you type is a row of switches inside the computer.',
        'A picture is a grid of tiny squares called pixels. In a black and white picture each pixel is 1 (dark) or 0 (light). The computer reads the picture row by row, and each row becomes a row of numbers. Colour photos use three numbers per pixel.'
      ],
      steps: [
        'Take the first letter of the word.',
        'Find its place in the alphabet: that is its number.',
        'Write the number in binary.',
        'For a picture: read one row of pixels at a time, dark = 1 and light = 0.',
        'Repeat until the whole word or picture is a list of numbers.'
      ],
      remember: 'Everything in a computer is stored as numbers: letters are numbers and pictures are grids of numbers.',
      time: { formula: 'Size = number of letters or pixels', text: 'A longer word needs more numbers, and a bigger picture needs many more. A picture with 1000 × 1000 pixels already has a million of them.' },
      used: 'Every text message, web page, photo and video. Real computers use a bigger table of codes (called Unicode) so they can also store Greek letters, emojis and many other alphabets.',
      watch: 'The number is not the letter itself, only a code for it. Different tables can use different codes, so computers must agree on which table to use.',
      pseudoNote: ''
    },

    net: {
      title: 'How the Internet Sends a Message',
      short: 'The internet',
      tag: 'How a message travels across the internet',
      goal: 'Follow a message that is cut into packets, travels in pieces and is put back together.',
      story: [
        'When you send a message or open a web page, it does not travel in one big piece. The internet cuts it into small pieces called packets. Each packet gets a number so we know its place.',
        'Packets travel through many routers, which are computers that pass them on. Each packet can take its own route, so they may arrive in a mixed up order. That is fine, because the numbers tell the receiver how to sort them.',
        'Sometimes a packet gets lost. The receiver can see which number is missing and asks the sender to send that packet again. Then the whole message is complete.'
      ],
      steps: [
        'Cut the message into small packets.',
        'Give every packet a number.',
        'Send each packet on its own route through the routers.',
        'The receiver puts the packets in order by their numbers.',
        'If a number is missing, ask for that packet again.'
      ],
      remember: 'The internet sends numbered packets. The numbers let the receiver rebuild the message and notice anything that is missing.',
      time: { formula: 'Packets = length / packet size', text: 'A message that is twice as long needs twice as many packets. Packets travel at the same time, so the internet stays fast.' },
      used: 'Every web page, video call, game and message you send. A single photo can travel as hundreds of packets.',
      watch: 'Packets are not secret by themselves. Anyone along the way could read them, which is why important data is also scrambled with codes before it is sent.',
      pseudoNote: ''
    },

    data: {
      title: 'Data and Charts',
      short: 'Data detective',
      tag: 'Read bar charts, find the biggest and the average',
      goal: 'Turn a table of numbers into a bar chart and find the biggest, the smallest, the total and the average.',
      story: [
        'Data is information written down as numbers. A table of numbers is hard to read at a glance, so we draw a bar chart: the taller the bar, the bigger the number.',
        'A data detective asks questions. Which day was the biggest? Which was the smallest? To answer, look at the tallest and the shortest bar.',
        'The total is all the numbers added together. The average is the total divided by how many numbers there are. It tells us what a typical day looks like.'
      ],
      steps: [
        'Write the numbers in a table.',
        'Draw one bar for each number: taller means bigger.',
        'Find the tallest and the shortest bar.',
        'Add up all the numbers to get the total.',
        'Divide the total by how many numbers there are to get the average.'
      ],
      remember: 'A chart shows numbers as pictures. The total is everything added up, and the average is the total divided by the count.',
      time: { formula: 'Time = n', text: 'The computer looks at each number once to find the biggest, the total or the average, so twice as much data takes twice as long.' },
      used: 'Weather reports, football statistics, school grades, and every app that shows you charts of your steps, your money or your screen time.',
      watch: 'An average can hide the details. Two weeks can have the same average even if one has a huge day and the other has the same number every day, so always look at the chart too.',
      pseudoNote: ''
    },

    ai: {
      title: 'Teach the Computer',
      short: 'Teach the computer',
      tag: 'Teach a computer to learn from examples',
      goal: 'See how a computer can guess the group of a new penguin by learning from examples, which is a simple kind of artificial intelligence.',
      story: [
        'Normally a programmer writes the rules. In machine learning, the computer learns from examples instead. We show it many penguins that we already know, each with a group: Little penguin or Emperor penguin.',
        'Each penguin has two numbers, its weight and its height, so we can draw it as a dot on a map. Penguins of the same group end up close together.',
        'When a new penguin arrives, the computer finds the example that is nearest on the map, and copies its group. This is called the nearest neighbour method.'
      ],
      steps: [
        'Collect examples that already have a group.',
        'Measure the new penguin: weight and height.',
        'Measure the distance to every example.',
        'Find the nearest example.',
        'Give the new penguin the same group as that example.'
      ],
      remember: 'A machine learning program learns from examples. It is only as good as its examples, and it can make mistakes.',
      time: { formula: 'Time = number of examples', text: 'The computer measures the distance to every example once, so ten times more examples means ten times more measuring.' },
      used: 'Recognising faces in photos, suggesting videos you may like, filtering spam emails and recognising your voice.',
      watch: 'If the examples are unfair, the answers will be unfair too. A computer that only saw tall penguins would guess wrongly about small ones. The computer does not understand, it only copies patterns.',
      pseudoNote: ''
    },

    robot: {
      title: 'Robot Penguin',
      short: 'Robot penguin',
      tag: 'Give the penguin commands to reach the fish',
      goal: 'Follow a program of commands, step by step, and see where the robot penguin ends up.',
      story: [
        'A program is a list of commands that a computer follows in order, one after the other. A robot can only do what its commands say, nothing more and nothing less.',
        'Our robot penguin understands three commands: go forward one square, turn left, and turn right. To reach the fish you must think about where the penguin is and which way it looks.',
        'Long programs repeat themselves. Instead of writing "forward" three times, we can write "repeat 3 times: forward". This is called a loop, and it makes programs shorter.'
      ],
      steps: [
        'Find where the penguin starts and which way it looks.',
        'Run the first command and see where the penguin is.',
        'Run the next command, and the next, always in order.',
        'When you see a repeat, run its commands that many times.',
        'Check if the penguin stopped on the fish.'
      ],
      remember: 'A program is a list of commands run in order. A repeat (loop) is a short way to write the same commands again.',
      time: { formula: 'Time = number of commands', text: 'The robot runs one command at a time, so a program twice as long takes twice as long to run.' },
      used: 'Real robots, robot vacuum cleaners, drones, drawing programs for children and video game characters all follow lists of commands.',
      watch: 'Turning does not move the penguin, and the direction matters: after a turn "forward" goes somewhere new. Always check which way the penguin looks before moving.',
      pseudoNote: 'The program is the list of commands.'
    },

    algo: {
      title: 'Flowcharts and Algorithms',
      short: 'Flowcharts',
      tag: 'Follow the arrows through a flowchart',
      goal: 'Read a flowchart: follow the arrows, do the steps and answer the questions to see how an algorithm works.',
      story: [
        'An algorithm is a list of steps that solves a problem, like a recipe. Before writing a program, programmers often draw the algorithm as a flowchart: a map of steps connected by arrows.',
        'A flowchart has four kinds of shapes. An oval means Start or End. A rectangle is a step to do. A diamond is a question with a yes arrow and a no arrow. Arrows show the order.',
        'Three ideas build every algorithm. Sequence: do steps one after another. Selection: choose a path with a question. Repetition: go back and do steps again until a question says stop.'
      ],
      steps: [
        'Start at the Start oval.',
        'Follow the arrow to the next shape.',
        'In a rectangle, do the step.',
        'In a diamond, answer the question and follow the yes or no arrow.',
        'Keep going until you reach the End oval.'
      ],
      remember: 'Every algorithm is built from sequence (steps in order), selection (questions) and repetition (going back).',
      time: { formula: 'Time = number of steps taken', text: 'To know how long an algorithm takes, count how many boxes you visit. A loop that goes around more times visits more boxes.' },
      used: 'Planning programs, explaining how a machine works, instructions for games and any process with steps and decisions, like a school office or a hospital.',
      watch: 'A loop needs a way out. If the question never says no, the arrows go around forever. In our counting example n goes up each time, so it finally stops.',
      pseudoNote: 'The pseudocode describes how to read any flowchart.'
    },

    logic: {
      title: 'Logic Gates',
      short: 'Logic gates',
      tag: 'AND, OR and NOT: how computers decide with switches',
      goal: 'Try every combination of switches on a logic gate and fill in its truth table.',
      story: [
        'Inside a computer there are millions of tiny parts called logic gates. A gate takes switches that are ON (1) or OFF (0) and gives one answer, which we show as a lamp.',
        'The AND gate lights the lamp only when both switches are ON. The OR gate lights it when at least one switch is ON. The NOT gate flips things: ON becomes OFF and OFF becomes ON.',
        'A table that lists every combination and the answer is called a truth table. Gates can be joined together, and that is how computers add numbers, remember things and make decisions.'
      ],
      steps: [
        'Choose a gate: AND, OR or NOT.',
        'Set the switches to a combination.',
        'Use the rule of the gate to decide if the lamp is ON.',
        'Write the answer in the truth table.',
        'Try the next combination, until the table is full.'
      ],
      remember: 'AND needs both, OR needs at least one, NOT flips. A truth table lists every case.',
      time: { formula: 'Rows = 2 to the power of the switches', text: 'With 1 switch there are 2 rows, with 2 switches 4 rows, with 3 switches 8 rows. Every new switch doubles the table.' },
      used: 'Every chip in every computer and phone is made of gates. The same ideas are in the "and" and "or" of search engines and in if questions in programs.',
      watch: 'In everyday speech "or" often means one or the other. In computers OR is also true when both are ON. Check the rule!',
      pseudoNote: 'Each line is the rule of one gate.'
    },

    types: {
      title: 'Data Types',
      short: 'Data types',
      tag: 'Numbers, text and true or false',
      goal: 'Sort values into number, text and true or false, and see how the same + works differently on each.',
      story: [
        'Every value in a program has a type. The type tells the computer what the value is and what it can do with it. The three most common types are numbers, text and true or false.',
        'Numbers are things like 7 or 3.5 and you can do maths with them. Text is written in quotes, like "ice". Even "7" in quotes is text, not a number! True or false is a yes-or-no answer.',
        'The type changes what an operation does. 3 + 4 adds the numbers and gives 7. But "3" + "4" joins two pieces of text and gives "34". The computer needs the type to know what you mean.'
      ],
      steps: [
        'Look at the value.',
        'Is it written in quotes? Then it is text.',
        'Is it true or false? Then it is a yes-or-no value.',
        'Otherwise, if it is made of digits, it is a number.',
        'Check the type before you use + or other operations.'
      ],
      remember: 'Numbers, text and true or false are data types. Quotes make text, and + adds numbers but joins text.',
      time: { formula: 'Time = number of values', text: 'Checking the type of each value takes one look, so more values take proportionally more time.' },
      used: 'Every form on a website: a name is text, an age is a number and a checkbox is true or false. Mixing them up is a common source of bugs.',
      watch: 'A phone number like "6912345678" is better stored as text, because you never do maths with it, and a leading 0 would be lost in a number.',
      pseudoNote: ''
    },

    arr: {
      title: 'Arrays',
      short: 'Arrays',
      tag: 'Many boxes, one name, counting from 0',
      goal: 'Read and change the boxes of an array using their index, then use a loop to add them up.',
      story: [
        'A variable is one box. An array is a whole row of boxes that share one name, like a row of lockers. Each box has an index, which is its number in the row.',
        'The surprise: counting starts at 0, not 1. In an array of 5 boxes the indexes are 0, 1, 2, 3 and 4. To read the first box we write numbers[0].',
        'Arrays and loops are best friends. A loop can visit every box, one by one, for example to add up all the numbers. An array can also have rows and columns, like a table, written table[row][column].'
      ],
      steps: [
        'Give the row of boxes a name.',
        'Choose an index: the number of the box, counting from 0.',
        'Read the box or write a new value into it.',
        'Use a loop to visit every box, from index 0 to the last.',
        'For a table, use two indexes: the row and then the column.'
      ],
      remember: 'An array is a row of boxes with one name. The index tells which box, and counting starts at 0.',
      time: { formula: 'Time = n', text: 'Reading one box by its index takes one step, however big the array is. Visiting every box takes n steps.' },
      used: 'Lists of scores, the pixels of a picture, the squares of a game board, the rows of a spreadsheet.',
      watch: 'The last box of an array of n boxes has index n − 1, not n. Asking for a box that does not exist is one of the most common bugs.',
      pseudoNote: ''
    },

    func: {
      title: 'Functions',
      short: 'Functions',
      tag: 'A named recipe you can use again and again',
      goal: 'Call functions with different inputs and follow how they return results.',
      story: [
        'A function is a recipe with a name. You give it inputs, called parameters, it follows its steps, and it gives back a result. For example double(x) gives back x times 2.',
        'The big idea: write the recipe once and use it many times, with different inputs. double(3) gives 6, double(5) gives 10. You do not need to repeat the steps.',
        'Functions can use other functions. In double(add(2, 3)) the inside call add(2, 3) runs first and gives 5. Then 5 goes into double, which gives 10.'
      ],
      steps: [
        'Give the function a name and decide its inputs.',
        'Write the steps that work out the result.',
        'Call the function with real values.',
        'The function returns the result.',
        'Use the result, or call the function again with new inputs.'
      ],
      remember: 'A function is a named recipe: inputs go in, a result comes out. Write it once, use it many times.',
      time: { formula: 'Time = time of the recipe', text: 'Each call takes as long as the steps inside the function. Calling it ten times takes ten times as long.' },
      used: 'Everything you use is built from functions: a calculator button, "print", "sort", the code that draws a button on screen.',
      watch: 'The names inside the brackets (x, w, h) are only placeholders. When you call the function, real values take their place.',
      pseudoNote: ''
    },

    rec: {
      title: 'Recursion',
      short: 'Recursion',
      tag: 'A function that calls itself, like dolls inside dolls',
      goal: 'Follow a function that calls itself, watch the calls pile up, and see the answers come back.',
      story: [
        'Imagine nesting dolls: open one and there is a smaller doll inside, and another inside that, until the smallest one. Recursion works the same way: a function solves a problem by calling itself on a smaller problem.',
        'The factorial of 4 is 4 × 3 × 2 × 1. We can say: fact(4) = 4 × fact(3). To know fact(3) we need fact(2), and so on. Each call waits, piling up like plates.',
        'Every recursion needs a base case, the smallest doll: fact(1) = 1. It stops the calling. Then the answers go back up the pile, one by one, and each call finishes its multiplication.'
      ],
      steps: [
        'Check if the problem is the smallest one (the base case). If so, answer directly.',
        'Otherwise, call the same function on a smaller problem.',
        'The call waits on the pile.',
        'When the base case answers, the answers return one by one.',
        'Each call uses the answer it got to finish its own work.'
      ],
      remember: 'Recursion is a function that calls itself on a smaller problem. It needs a base case to stop.',
      time: { formula: 'Time = n calls', text: 'fact(n) makes n calls, one per smaller problem, so the work grows in step with n.' },
      used: 'Searching folders on a computer, drawing trees and snowflakes, solving puzzles like Tower of Hanoi, and quick sort and merge sort.',
      watch: 'Without a base case the calls never stop and the program crashes. Always make sure each call works on a smaller problem.',
      pseudoNote: 'Each call waits for the call below it.'
    },

    hw: {
      "title": "Inside the Computer",
      "short": "Computer parts",
      "tag": "Input, brain, memory, storage and output",
      "goal": "Follow a letter and a drawing through the five parts of a computer.",
      "story": [
        "A computer is a team of five parts. Input devices, like the keyboard, mouse and microphone, let you tell the computer things. The CPU is the brain: it follows instructions and does the calculations.",
        "Memory (RAM) is the quick desk where the computer keeps what it is working on right now. It is very fast but it forgets everything when the power goes off. Storage, like a disk or a flash drive, is the cupboard: it keeps your files for a long time.",
        "Output devices, like the screen, speakers and printer, show you the result. Every program uses all five parts: you give input, the CPU works, memory holds the work, storage saves it and output shows it."
      ],
      "steps": [
        "You give input with a key, the mouse or your voice.",
        "The CPU follows the instructions and calculates.",
        "The work waits in memory while the computer uses it.",
        "Save to put the work in storage so it stays.",
        "Output shows you the result."
      ],
      "remember": "A computer has input, a CPU (brain), memory (fast but forgets), storage (keeps things) and output.",
      "time": {
        "formula": "Speed = CPU + memory",
        "text": "A faster CPU and more memory make a computer feel quicker, but the five parts and the jobs they do stay the same."
      },
      "used": "Phones, tablets, game consoles, cash machines and even smart watches all have these same five kinds of parts.",
      "watch": "Memory forgets when the power goes off. If you have not saved your work to storage, it can be lost.",
      "pseudoNote": ""
    },

    os: {
      "title": "Files and Folders",
      "short": "Files",
      "tag": "Folders inside folders, and the path to a file",
      "goal": "Walk down a tree of folders and write the path to a file.",
      "story": [
        "A computer keeps your files in folders. A folder can hold files and other folders, and those can hold more folders. Drawn on paper it looks like an upside-down tree, so we call it a folder tree. The top folder is the root.",
        "To find a file you start at the top and open one folder after another until you reach the file. The list of folders you opened, joined with a / sign, is called the path, for example Home/School/Maths/homework.txt.",
        "The path is the address of the file. Two files can have the same name, like notes.txt, as long as they are in different folders, because their paths are different. Tidy folders make files easy to find."
      ],
      "steps": [
        "Start at the top folder.",
        "Open the folder that leads towards your file.",
        "Keep opening folders, one after another.",
        "Write the folder names joined with / to get the path.",
        "The file name comes at the end of the path."
      ],
      "remember": "Folders can hold files and other folders. The path is the folder names joined with /, ending with the file.",
      "time": {
        "formula": "Time = number of folders on the path",
        "text": "Finding a file by hand means opening one folder after another, so a deeper path takes a few more steps. A search tool can jump straight to the file."
      },
      "used": "Your pictures, your homework, the apps on your phone and every website address (a URL has a path too) are organised like this.",
      "watch": "The same file name can exist in many folders. Always check the whole path, not only the name.",
      "pseudoNote": ""
    },

    sheet: {
      "title": "Spreadsheets",
      "short": "Spreadsheets",
      "tag": "Cells, formulas and sums that update themselves",
      "goal": "Use cell names and formulas, and watch a sum update by itself.",
      "story": [
        "A spreadsheet is a big table made of cells. Every cell has a name made of its column letter and its row number: column B and row 1 make B1. A cell can hold a number, a word or a formula.",
        "A formula starts with an equals sign and uses cell names, like =A1+B1. The spreadsheet works out the answer and shows it in the cell. Functions help with bigger jobs: SUM adds a whole range of cells, like A1:A4, and MAX finds the biggest.",
        "The best part: when you change a number, every formula that uses it updates by itself. You do not have to calculate anything again."
      ],
      "steps": [
        "Find the cell by its column letter and row number.",
        "Type = and then a formula using cell names.",
        "The spreadsheet shows the answer in the cell.",
        "Change a number in a cell the formula uses.",
        "Watch the answer update by itself."
      ],
      "remember": "A spreadsheet has cells named like B2. Formulas start with = and update by themselves when the numbers change.",
      "time": {
        "formula": "Time = number of cells",
        "text": "SUM looks at each cell in the range once, so a longer range takes more work. A computer does this in the blink of an eye."
      },
      "used": "Shopping budgets, school marks, science results, sports tables and the accounts of every company.",
      "watch": "A formula uses cell names, not the numbers inside. If you type the number instead of the cell name, the answer will not update.",
      "pseudoNote": ""
    },

    db: {
      "title": "Databases",
      "short": "Databases",
      "tag": "Tables of facts: filter, sort and count",
      "goal": "Filter, sort and count the rows of a penguin table.",
      "story": [
        "A database stores facts in tables. Each row is one thing, like one penguin, and is called a record. Each column is one kind of fact, like age or colony, and is called a field.",
        "Three tools answer most questions. A filter keeps only the rows that match a rule, like colony = A. Counting tells how many rows are left. Sorting puts the rows in order, like youngest first.",
        "Real databases have many tables that are linked together, and they can hold millions of rows. They use the same three ideas: filter, sort and count."
      ],
      "steps": [
        "Look at the columns and rows of the table.",
        "Write a rule and filter the rows that match it.",
        "Count the rows that are left.",
        "Sort the rows by one column.",
        "Combine filter and sort to answer a question."
      ],
      "remember": "A database is made of tables. Filter keeps matching rows, count tells how many, and sort puts them in order.",
      "time": {
        "formula": "Time = number of rows",
        "text": "A filter looks at every row once. Real databases keep an index, like the index of a book, so they can find rows much faster."
      },
      "used": "Online shops, school registers, game scores, music libraries and library catalogues.",
      "watch": "Read the rule very carefully. \"age > 3\" does not include 3, but \"age ≥ 3\" does.",
      "pseudoNote": ""
    },

    sec: {
      "title": "Passwords and Phishing",
      "short": "Staying safe",
      "tag": "Make strong passwords and spot tricky messages",
      "goal": "Check passwords with five tests and find the clues in a trick message.",
      "story": [
        "A password is the key to your account. A strong password is long and mixes capital letters, small letters, numbers and symbols. A little sentence with funny parts is easy for you to remember and hard to guess. Use a different password for every account and never share it.",
        "Phishing is a trick message that tries to make you click a link or give away a secret. It sounds like fishing because the trickster throws out bait. The bait is often a prize, a scary warning or a request for help.",
        "Look for four clues: an odd sender address, a hurry, a request for a secret like a password, and a link that goes somewhere else than it says. If you see any, do not click. Show a grown-up."
      ],
      "steps": [
        "Check the password against the five tests.",
        "Make it longer and mix more kinds of characters.",
        "Read a message slowly and look for clues.",
        "Never type a password because a message asks.",
        "If unsure, do not click and ask a grown-up."
      ],
      "remember": "Strong passwords are long and mixed. Never share them. Messages that hurry you or ask for secrets are tricks.",
      "time": {
        "formula": "Guesses = choices ^ length",
        "text": "Every extra character multiplies the number of guesses a hacker needs. That is why long passwords are so strong."
      },
      "used": "Every account you will ever have: email, games, school systems and banking all need strong passwords and careful reading of messages.",
      "watch": "The passwords in this lesson are made up. Never type your real password into a lesson, a quiz or a message.",
      "pseudoNote": ""
    },

    cit: {
      "title": "Digital Citizenship",
      "short": "Online manners",
      "tag": "Privacy, kindness, credit and good sources",
      "goal": "Practise safe, kind and honest choices online.",
      "story": [
        "The internet is like a big town square that everyone shares. Good digital citizens keep personal information private: full name, address, school, phone number and passwords stay secret. They also tell a grown-up if a stranger asks personal questions.",
        "Behind every screen is a real person. Write only what you would say to their face, and say it kindly. Everything people make, like pictures, songs and texts, belongs to them. Ask or check the licence, and always give credit.",
        "Not everything online is true. Trust sources that name the author, show a date and say where the facts come from, and compare more than one. Write in your own words instead of copying, and name your sources."
      ],
      "steps": [
        "Keep personal information private.",
        "Be kind: write what you would say face to face.",
        "Check if you may use a picture, song or text, and give credit.",
        "Check the source: author, date and where the facts come from.",
        "If something feels wrong, tell a grown-up."
      ],
      "remember": "Keep private things private, be kind, give credit and check your sources.",
      "time": {
        "formula": "Time = a moment to think",
        "text": "Thinking for a moment before you post, click or copy costs almost nothing and can save a lot of trouble."
      },
      "used": "Every time you chat, play online, search for information or make a school project with pictures and facts from the internet.",
      "watch": "Something you post can be copied and stay online for a very long time. Ask yourself first: would I be happy if everyone saw this?",
      "pseudoNote": ""
    },

    bfs: {
      title: 'Breadth-First Search',
      short: 'BFS',
      tag: 'Spread out like ripples in a pond',
      goal: 'Find the shortest way to the fish by checking all the close places first.',
      story: [
        'Drop a pebble in a pond. The ripples spread out in rings: small, bigger, bigger still. BFS explores a map the same way. First it visits every place one hop from the start. Then every place two hops away. Then three hops, and so on.',
        'Because BFS never jumps ahead, the first time it reaches the fish it has found the shortest way. A hop is one path from a place to its neighbour.',
        'To remember what to visit next, BFS uses a queue. A queue is like the line at the ice cream shop: the penguin who arrived first is served first.'
      ],
      steps: [
        'Put the start place in the waiting line.',
        'Take the first place from the line and visit it.',
        'Is the fish here? Then stop. You did it!',
        'If not, add its new neighbours to the end of the line.',
        'Go back to step 2.'
      ],
      remember: 'A queue is first in, first out. The place that has waited longest goes next.',
      time: { formula: 'Time = V + E', text: 'V is the number of places and E is the number of paths. BFS looks at every place once and every path once. If the map gets twice as big, the work gets about twice as big.' },
      used: 'Phone maps use ideas like this to find the fewest turns. It also finds friends of friends in a social network, and the nearest cafe on a map.',
      watch: 'On a huge, wide-open map the waiting line gets very long, so BFS needs a lot of memory.',
      pseudoNote: ''
    },

    dfs: {
      title: 'Depth-First Search',
      short: 'DFS',
      tag: 'Go deep, then step back',
      goal: 'Find a way to the fish by following one path as far as it goes.',
      story: [
        'Imagine a cave with lots of tunnels and a ball of string to find your way back. You pick a tunnel and keep walking. At a dead end you follow the string back to the last place that had another tunnel, and try that one. DFS does exactly that.',
        'To remember where to go back to, DFS uses a stack. A stack is like a pile of pancakes: you always take the top one, the one that was put there last.',
        'DFS will find the fish if there is a way, but the way it finds can be long and twisty. It is not always the shortest.'
      ],
      steps: [
        'Put the start place on the pile.',
        'Take the top place from the pile and visit it.',
        'Is the fish here? Then stop. You did it!',
        'If not, put its new neighbours on top of the pile.',
        'Go back to step 2. A dead end just leaves older places in the pile, so the penguin walks back to them.'
      ],
      remember: 'A stack is last in, first out. The newest place goes next.',
      time: { formula: 'Time = V + E', text: 'The same as BFS: every place and every path is looked at once. The difference is the order, not the speed.' },
      used: 'Solving mazes, checking if two places are connected, finding loops, and putting jobs in order when some jobs must happen before others.',
      watch: 'Do not use DFS when you need the shortest way. On the first example it takes a long detour that BFS avoids.',
      pseudoNote: ''
    },

    sel: {
      title: 'Selection Sort',
      short: 'Selection sort',
      tag: 'Pick the shortest penguin, again and again',
      goal: 'Put the penguins in order by always choosing the shortest one that is left and moving it to the front.',
      story: [
        'Selection sort works like picking teams. Look along the whole line and find the shortest penguin. Swap it with the penguin at the front. Now the first place is perfect and never changes again.',
        'Do the same with the rest of the line: search for the shortest penguin that is left and swap it into the second place. Then the third place, and so on.',
        'Each round fixes one more place. When only one penguin is left, it has to be the tallest, so the whole line is in order.'
      ],
      steps: [
        'Look at the first place that is not fixed yet. Call the penguin there "the smallest so far".',
        'Walk along the rest of the line. If you meet a shorter penguin, it becomes the new smallest.',
        'At the end of the walk, swap the smallest penguin into the first open place.',
        'That place is now fixed. Repeat for the next place.'
      ],
      remember: 'Selection sort searches for the shortest penguin every round, and every round fixes exactly one place.',
      time: { formula: 'Time = n × n', text: 'To fix each of the n places you look at all the penguins that are left. That is about n × n looks. Selection sort does not get faster when the line is almost sorted, but it makes very few swaps.' },
      used: 'Learning how sorting works, and cases where moving things is expensive, because it swaps at most once per round.',
      watch: 'It is slow for long lines, because it always searches the whole rest of the line, even if everything is already in order.',
      pseudoNote: ''
    },

    ins: {
      title: 'Insertion Sort',
      short: 'Insertion sort',
      tag: 'Slide each penguin into the right place, like sorting cards',
      goal: 'Put the penguins in order by taking them one at a time and sliding each one back to its right place.',
      story: [
        'Insertion sort works like sorting playing cards in your hand. At the start, the first penguin alone is already a sorted line of one.',
        'Take the next penguin. Compare it with the one on its left. If the left one is taller, they swap, and your penguin steps one place to the left. Keep going until the left neighbour is shorter, or you reach the front.',
        'Now the sorted part is one penguin longer. Take the next penguin and do it again, until nobody is left outside the sorted part.'
      ],
      steps: [
        'The first penguin alone is a sorted part.',
        'Take the next penguin just outside the sorted part.',
        'Compare it with its left neighbour. If the neighbour is taller, swap them.',
        'Keep stepping left until the neighbour is shorter or you reach the front.',
        'Repeat until every penguin is in the sorted part.'
      ],
      remember: 'Insertion sort keeps a sorted part on the left that grows by one penguin every round.',
      time: { formula: 'Time = n × n', text: 'In the worst case every penguin has to slide all the way to the front, which is about n × n steps. But if the line is already almost sorted, each penguin hardly moves and it is very fast. Try the "Already sorted" example!' },
      used: 'Sorting small lists, and lists that are nearly in order. Many real sorting programs use it for the small pieces.',
      watch: 'A line that is in reverse order is the worst case: every penguin has to slide all the way. Try the "Reversed" example.',
      pseudoNote: ''
    },

    bin: {
      title: 'Binary Search',
      short: 'Binary search',
      tag: 'Find a penguin by always checking the middle',
      goal: 'Find one penguin in a line that is already in order, by looking at as few penguins as possible.',
      story: [
        'Imagine a line of penguins standing from the shortest to the tallest, and you want to find one special penguin. You could check them one by one, but there is a much cleverer way.',
        'Look at the penguin in the middle. If it is the one you want, you are done! If it is too short, the penguin you want must be on the taller side, so you can forget the whole shorter half. If it is too tall, forget the taller half.',
        'Now do the same with the half that is left: look at its middle, and throw away half again. Every look cuts the line in half, so you find the penguin very fast.'
      ],
      steps: [
        'Make sure the line is in order, from shortest to tallest.',
        'Look at the penguin in the middle of the part you are searching.',
        'Is it the one you want? Then you found it!',
        'Too short? Keep only the taller half. Too tall? Keep only the shorter half.',
        'Repeat. If no penguins are left, the penguin is not in the line.'
      ],
      remember: 'Binary search only works when the line is already in order. Every look throws away half of the penguins.',
      time: { formula: 'Time = log₂(n)', text: 'With n penguins you need about log₂(n) looks. A line of 1,000 penguins needs only about 10 looks, and a line of 1,000,000 penguins needs only about 20! Checking one by one could take a million.' },
      used: 'Looking up a word in a dictionary, finding a name in a sorted contact list, and searching huge sorted lists in computers.',
      watch: 'If the line is not in order, binary search gives wrong answers. Sort first, then search.',
      pseudoNote: ''
    },

    topo: {
      title: 'Topological Sort',
      short: 'Topological sort',
      tag: 'Do things in an order where every job comes after what it needs',
      goal: 'Put the places in an order so that every arrow points forward: a place always comes after the places that point to it.',
      story: [
        'Getting dressed is a good example. You must put on socks before shoes, and a shirt before a jacket. An arrow in the map means "this must come first".',
        'Some places have no arrow pointing into them. Nothing has to come before them, so they are ready! Put them in the ready line.',
        'Take the first place from the line and write it in the order. Then remove its arrows. Some places now have nothing left to wait for, and they join the ready line. Keep going until everything is in the order.'
      ],
      steps: [
        'Count the arrows pointing into every place.',
        'Put all places with zero arrows into the ready line.',
        'Take the first place from the line and add it to the order.',
        'Remove its arrows. If a place now has zero arrows, add it to the ready line.',
        'Repeat until the ready line is empty.'
      ],
      remember: 'A place is ready when no arrows point into it any more. There can be several good orders.',
      time: { formula: 'Time = V + E', text: 'V is the number of places and E is the number of arrows. Every place is taken once and every arrow is removed once, so the work grows in step with the size of the map.' },
      used: 'Planning school subjects where some must come first, building programs in the right order, and deciding the order of jobs in a project.',
      watch: 'It only works when there are no circles of arrows. If A needs B and B needs A, nobody can go first and the line gets stuck.',
      pseudoNote: ''
    },

    sq: {
      title: 'Stack and Queue',
      short: 'Stack and queue',
      tag: 'Two ways to make penguins wait: a line and a pile',
      goal: 'See the difference between a queue (a line) and a stack (a pile) when the same penguins arrive and leave.',
      story: [
        'A queue is like the line at the ice-cream stand. The first penguin who arrives is the first to be served. We call this first in, first out.',
        'A stack is like a pile of plates. You put a new plate on top and you also take a plate from the top. The last penguin who arrives is the first to leave. We call this last in, first out.',
        'Computers use both all the time. Breadth-First Search uses a queue, so it explores in widening ripples. Depth-First Search uses a stack, so it dives deep and then comes back.'
      ],
      steps: [
        'A new penguin arrives. Queue: it joins the back of the line. Stack: it goes on top.',
        'Time to take a penguin. Queue: take the one at the front. Stack: take the one on top.',
        'Watch which penguins leave. The two structures give different penguins from the same arrivals.'
      ],
      remember: 'Queue: first in, first out. Stack: last in, first out.',
      time: { formula: 'Time = 1 step', text: 'Adding a penguin and taking a penguin each take just one step, however many penguins are waiting. That is why queues and stacks are so useful inside other algorithms.' },
      used: 'A queue: print jobs, waiting lines in games, BFS. A stack: the undo button, the back button in a browser, DFS.',
      watch: 'Do not mix them up! The same arrivals give different leaving orders. Check which end the penguin leaves from.',
      pseudoNote: ''
    },

    heap: {
      title: 'Heap',
      short: 'Heap',
      tag: 'A family tree where the shortest penguin is always on top',
      goal: 'Build a family tree of penguins where every parent is shorter than its children, so the shortest is always at the top.',
      story: [
        'A heap is a family tree with one simple rule: every parent is shorter than its children. That means the shortest penguin of all is always at the very top, ready to be taken.',
        'To add a penguin, put it in the next free place at the bottom. If it is shorter than its parent, swap them. Keep swapping upwards until the rule holds again.',
        'To take the shortest penguin out, remove the top one and move the last penguin up to fill the gap. It may be too tall for the top, so swap it downwards with its shorter child until the rule holds again.'
      ],
      steps: [
        'The rule: every parent is shorter than its children.',
        'Add a penguin at the next free place at the bottom.',
        'While it is shorter than its parent, swap them.',
        'To take the top penguin, move the last penguin to the top.',
        'While it is taller than its smaller child, swap them.'
      ],
      remember: 'In a heap the shortest penguin is always on top, and fixing the tree after a change only takes a few swaps.',
      time: { formula: 'Time = log₂(n)', text: 'A tree of n penguins is only about log₂(n) levels tall, and a penguin moves at most one swap per level. With a million penguins that is about 20 swaps, so adding and taking the shortest is very quick.' },
      used: 'Priority lines (who is next?), Dijkstra and Prim to find the cheapest place quickly, and heap sort.',
      watch: 'A heap only promises that the SHORTEST is on top. The other penguins are not completely in order. Try the "Reversed" example to see many swaps.',
      pseudoNote: ''
    },

    dij: {
      title: "Dijkstra's Algorithm",
      short: 'Dijkstra',
      tag: 'The cheapest way, not just the shortest',
      goal: 'Find the cheapest way from the start to the fish when every path has a price.',
      story: [
        'On this map every path has a price, like the minutes it takes to swim across. A long path can be cheap and a short path can be expensive. So counting hops is not enough.',
        'Dijkstra (say DYKE-struh) gives every place a cost. The start costs 0, because you are already there. All the other places get infinity, which means "no way found yet".',
        'Then it repeats one trick: pick the place that is not done yet and has the smallest cost. Check its neighbours. If going through this place makes a neighbour cheaper, update the neighbour and leave a yellow arrow that points back. At the end, follow the yellow arrows to read the cheapest way.'
      ],
      steps: [
        'Give the start place cost 0 and every other place infinity.',
        'Pick the not-done place with the smallest cost.',
        'For each neighbour: add the price of the path to this place\'s cost. If that is smaller than the neighbour\'s cost, update it and leave a yellow arrow back.',
        'Mark the place as done. Its cost can never get better.',
        'Repeat until the fish place is done. Then follow the yellow arrows back to the start.'
      ],
      remember: 'Always pick the cheapest place that is not done yet.',
      time: { formula: 'Time = (V + E) × log₂(V)', text: 'With a smart helper list that always knows the cheapest place, Dijkstra is almost as fast as BFS. The log₂ part is the cost of keeping that list in order.' },
      used: 'Apps that find the quickest drive, the cheapest flight, or the best route for a delivery robot or a character in a video game.',
      watch: 'Prices must never be negative. A path that pays you to walk it would break the idea that a done place can never get cheaper.',
      pseudoNote: ''
    },


    bs: {
      title: 'Bubble Sort',
      short: 'Bubble sort',
      tag: 'Swap neighbours until nobody is out of order',
      goal: 'Put the penguins in order from the shortest to the tallest by swapping neighbours.',
      story: [
        'Bubble sort is the simplest way to sort. Walk along the line and look at two neighbours at a time. If the left penguin is taller than the right one, they swap places. If not, they stay.',
        'After one walk along the whole line, the tallest penguin has been carried all the way to the end, like a bubble rising to the top of a glass. That place is final, so the next walk can stop one penguin earlier.',
        'Keep walking until a whole walk makes no swaps at all. Then everyone is in order.'
      ],
      steps: [
        'Start at the left end of the line.',
        'Compare two neighbours. If the left one is taller, swap them.',
        'Move one step to the right and repeat until you reach the sorted part at the end.',
        'The tallest penguin of the group is now in its final place.',
        'Walk again. Stop when a walk makes no swaps.'
      ],
      remember: 'Bubble sort only ever compares two neighbours, and each walk fixes one penguin at the end.',
      time: { formula: 'Time = n × n', text: 'With n penguins you walk about n times and each walk looks at about n pairs. Double the line and the work becomes four times as big. That is slow for long lines, but if the line is already sorted, one walk is enough to find out.' },
      used: 'Learning how sorting works, and sorting very short lists. Real programs use faster methods like quick sort and merge sort for long lists.',
      watch: 'It is easy to understand but slow. Try the "Reversed" example to see how many swaps it needs.',
      pseudoNote: ''
    },

    bf: {
      title: 'Bellman-Ford',
      short: 'Bellman-Ford',
      tag: 'Find cheapest costs, even when a road gives a discount',
      goal: 'Find the cheapest cost to reach every place from the start, on a map with one-way roads where one road gives a discount.',
      story: [
        'Dijkstra is great, but it does not like discounts: a road with a negative cost can trick it. Bellman-Ford is the careful cousin that handles them.',
        'It does something very simple. Go through every road, one after another, and ask: is it cheaper to reach the end of this road by using it? If yes, write the cheaper cost. That is called relaxing the road.',
        'Do a whole pass over all roads, then do another pass. A cheaper cost found in one pass can make more roads cheaper in the next pass. Stop when a pass changes nothing.'
      ],
      steps: [
        'The start costs 0. Every other place costs ∞ (not reached yet).',
        'Go through every road u → v with cost w.',
        'If cost(u) + w is cheaper than cost(v), write the new cost for v.',
        'Do another pass over all the roads.',
        'Stop when a whole pass changes nothing.'
      ],
      remember: 'Bellman-Ford keeps trying every road until nothing gets cheaper. It works even with negative costs.',
      time: { formula: 'Time = V × E', text: 'V is the number of places and E the number of roads. You may need up to V − 1 passes, and each pass looks at every road once. That is slower than Dijkstra, but it can do things Dijkstra cannot.' },
      used: 'Finding cheapest routes when some steps give you a refund or a discount, and spotting money loops in currency exchange.',
      watch: 'The order of the roads matters for how many passes you need, but never for the final answer. Try to find the road with the discount: it is the one with a minus sign.',
      pseudoNote: ''
    },

    prim: {
      title: "Prim's Algorithm",
      short: 'Prim',
      tag: 'Grow one tree with the cheapest path each time',
      goal: 'Connect all the places with the cheapest set of paths, growing a tree from the start.',
      story: [
        'Imagine the penguins must build bridges between six ice islands. Every bridge has a price and they want everyone connected for the smallest total price. The cheapest set of bridges that connects everything is called a minimum spanning tree.',
        'Prim starts on one island. That island is the tree. Then it looks at every path with exactly ONE end in the tree and takes the cheapest one. The island at the other end joins the tree.',
        'Repeat until all islands are in the tree. A path with both ends in the tree is never used, because it would only make a loop.'
      ],
      steps: [
        'Start with just one place in the tree.',
        'Look at all paths that leave the tree (one end in, one end out).',
        'Take the cheapest of them. Its new place joins the tree.',
        'Go back to step 2 until every place is in the tree.'
      ],
      remember: 'Prim grows ONE tree, and always takes the cheapest path that leaves it.',
      time: { formula: 'Time = (V + E) × log₂(V)', text: 'V is the number of places and E the number of paths. With a smart helper list that always knows the cheapest path, Prim is quick even on big maps.' },
      used: 'Planning cables, pipes or roads that must reach every house for the lowest cost. Also used to group similar things together.',
      watch: 'Prim only works when all places can be reached from each other. The total cost is the same wherever you start, but the order is different. Try the three examples!',
      pseudoNote: ''
    },

    kruskal: {
      title: "Kruskal's Algorithm",
      short: 'Kruskal',
      tag: 'Take the cheapest paths, skip any that make a loop',
      goal: 'Connect all the places with the cheapest set of paths by choosing from the whole list.',
      story: [
        'Kruskal solves the same bridge problem as Prim in a different way. First write down every path from the cheapest to the most expensive.',
        'Then go down the list. For each path ask: are its two ends already connected through other paths? If NOT, take the path. If they ARE, skip it, because it would only make a loop.',
        'You are done when you have one path fewer than the number of places. Then everything is connected.'
      ],
      steps: [
        'Sort all the paths from cheapest to most expensive.',
        'Look at the next path in the list.',
        'If its two ends are not connected yet, take it.',
        'If they are already connected, skip it (it would make a loop).',
        'Stop when you have (places − 1) paths.'
      ],
      remember: 'Kruskal looks at all the paths in price order and skips any that make a loop.',
      time: { formula: 'Time = E × log₂(E)', text: 'E is the number of paths. Most of the work is sorting the list of paths. Checking whether two places are connected is very quick with the right trick.' },
      used: 'The same jobs as Prim: networks of cables, pipes and roads. Kruskal is nice when the paths come as a list.',
      watch: 'Kruskal may build several small trees first and join them later. Prim and Kruskal always find the same total cost, even if they pick the paths in a different order.',
      pseudoNote: ''
    },

    qs: {
      title: 'Quick Sort',
      short: 'Quick sort',
      tag: 'Split the line around a boss penguin',
      goal: 'Put the penguins in order from the shortest to the tallest.',
      story: [
        'Pick one penguin and call it the pivot, the boss. Ask everyone: are you shorter than the pivot? Shorter penguins go to its left. Taller penguins go to its right.',
        'Now the pivot is exactly where it belongs! The penguins on each side are not in order yet, but they are on the right side. So we do the same trick again on the left group and on the right group.',
        'We keep going until every group has just one penguin. A group of one is already sorted. This idea is called divide and conquer: split a big problem into small ones.'
      ],
      steps: [
        'If the group has 0 or 1 penguins, it is already sorted.',
        'Pick a pivot. Here it is the last penguin in the group.',
        'Compare every other penguin with the pivot. Shorter ones go left, taller ones stay right.',
        'Put the pivot between the two groups. It is now in its final place.',
        'Do the same for the left group and for the right group.'
      ],
      remember: 'Divide and conquer: split the big problem into smaller ones and solve those.',
      time: { formula: 'Time = n × log₂(n)', text: 'n is the number of penguins. With a good pivot every split cuts the group about in half, and each round touches every penguin once. If you are unlucky with the pivot it can take n × n steps. Try the "Already sorted" example to see that!' },
      used: 'Sorting long lists quickly: names, scores, prices. Many programming languages use a smarter version of quick sort.',
      watch: 'A bad pivot makes it slow. With the last penguin as pivot, a line that is already sorted is the worst case. Real programs pick a random or middle penguin.',
      pseudoNote: ''
    },

    ms: {
      title: 'Merge Sort',
      short: 'Merge sort',
      tag: 'Cut in halves, then join in order',
      goal: 'Sort the penguins by cutting the line in halves again and again, then joining the pieces back in order.',
      story: [
        'Sorting one penguin is easy: it is already sorted! So cut the line in half, and cut each half in half, until every piece has just one penguin.',
        'Then join the pieces back together, two at a time. To join two sorted pieces, look at the front penguin of each piece and take the shorter one. Do that again and again until both pieces are used up. The new piece is sorted too.',
        'Keep joining until there is one piece left. It is the whole line, in order.'
      ],
      steps: [
        'Cut the line in half.',
        'Keep cutting every piece in half until each piece has one penguin.',
        'Join two pieces: compare their front penguins and take the shorter one, again and again.',
        'Keep joining pieces until one sorted line is left.'
      ],
      remember: 'Joining two sorted pieces is easy and fast: only the front penguins ever need to be compared.',
      time: { formula: 'Time = n × log₂(n)', text: 'Cutting in halves takes about log₂(n) rounds, and each round touches every penguin once. Merge sort is this fast every time, even for a line that is already sorted.' },
      used: 'Sorting big files, and any job where you want a speed you can always count on.',
      watch: 'It needs extra room for the pieces while it joins them.',
      pseudoNote: ''
    }
  };

  var data = { en: EN };
  var C = {
    order: ['bits', 'hw', 'loop', 'vars', 'types', 'cond', 'robot', 'algo', 'bug', 'arr', 'func', 'logic', 'os', 'sheet', 'db', 'sec', 'cit', 'bfs', 'dfs', 'bs', 'sel', 'ins', 'bin', 'rep', 'race', 'cipher', 'net', 'data', 'ai', 'rec', 'topo', 'sq', 'heap', 'dij', 'bf', 'prim', 'kruskal', 'qs', 'ms'],
    /* The school-book style topics. Every lesson belongs to exactly one topic. */
    books: [
      { id: 'sys', kinds: ['hw', 'os', 'logic'] },
      { id: 'prog', kinds: ['robot', 'vars', 'types', 'cond', 'loop', 'arr', 'func', 'rec', 'bug'] },
      { id: 'algo', kinds: ['algo', 'race', 'bin', 'bs', 'sel', 'ins', 'qs', 'ms'] },
      { id: 'ds', kinds: ['sq', 'heap', 'bfs', 'dfs', 'topo', 'dij', 'bf', 'prim', 'kruskal'] },
      { id: 'data', kinds: ['bits', 'rep', 'data', 'sheet', 'db', 'ai'] },
      { id: 'net', kinds: ['net', 'cipher', 'sec', 'cit'] }
    ],
    add: function (lang, obj) { data[lang] = obj; }
  };
  Object.keys(EN).forEach(function (k) {
    Object.defineProperty(C, k, {
      enumerable: true,
      get: function () {
        var d = data[I18n.lang()] || EN;
        if (k === 'ui') return Object.assign({}, EN.ui, d.ui);
        return d[k] || EN[k];
      }
    });
  });
  return C;
});
