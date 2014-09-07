// Written by Jürgen Moßgraber - mossgrabers.de
// (c) 2014
// Licensed under LGPLv3 - http://www.gnu.org/licenses/lgpl-3.0.txt

function Grid (output)
{
    this.output = output;

    this.arraySize = 8 * 8;
    this.currentButtonColors = initArray (APC_COLOR_BLACK, this.arraySize);
    this.buttonColors = initArray (APC_COLOR_BLACK, this.arraySize);
}

Grid.prototype.light = function (x, y, color)
{
    this.buttonColors[y * 8 + x] = color;
};

Grid.prototype.flush = function ()
{
    for (var i = 0; i < this.arraySize; i++)
    {
        var baseChanged = false;
        if (this.currentButtonColors[i] == this.buttonColors[i])
            continue;
        this.currentButtonColors[i] = this.buttonColors[i];
        var pos = (7 - Math.floor (i / 8)) * 8 + (i % 8)
        this.output.sendNote (pos, this.buttonColors[i]);
        baseChanged = true;
    }
};

Grid.prototype.turnOff = function ()
{
    for (var i = 0; i < this.arraySize; i++)
        this.buttonColors[i] = APC_COLOR_BLACK;
    this.flush ();
};
