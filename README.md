Assignment 4 - Creative Coding: Interactive Multimedia Experiences
===
## Square push

your hosting link e.g. http://a4-nicolas-valentino.glitch.me

This application was made using React and uses an express server. It was made using canvas. The application is a game where the goal is to remove all the colored squares from the game board by pushing them together into a 2x2 square of single squares of the same color to remove them. The squares are pushed using an image of a cat that takes up a 2x2 of the grid of the game board. The four parameters of user control are arrow buttons to move the image of a cat around, a remove button to remove a 2x2 square, a reset button to completely reset the game board, and buttons to select which configuration of the game board a user wants to play.

The default configuration of the game is very basic and can be used to test all functionalities of the game. Configurations 2, 3, 4 are all more complex with configuration 4 being the hardest.

A challenge I faced when creating this project is that when the game is initially loaded onto the webpage, the cat is not properly drawn and the only way to fix this is by clicking any of the buttons on the webpage to cause the game board to update and draw the cat.

A list of instructions to play the game are presented on the website. The only additional instruction to provide is to fix the issue mentioned above; to draw the cat on the board any of the buttons need to be clicked, but it is recommended to click either the reset button or select a different configuration so the cat is in the starting position when it is drawn instead of trying to move the cat without knowing where it is.