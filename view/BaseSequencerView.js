// Written by Jürgen Moßgraber - mossgrabers.de
// (c) 2014-2016
// Licensed under LGPLv3 - http://www.gnu.org/licenses/lgpl-3.0.txt

function BaseSequencerView (model, rows, cols)
{
    if (!model) // Called on first prototype creation
        return;
    AbstractSequencerView.call (this, model, rows, cols);
}
BaseSequencerView.prototype = new AbstractSequencerView ();

BaseSequencerView.prototype.onActivate = function ()
{
    AbstractSequencerView.prototype.onActivate.call (this);
    this.model.getCurrentTrackBank ().setIndication (true);
};

BaseSequencerView.prototype.onScene = function (scene, event)
{
    if (this.surface.isShiftPressed ())
    {
        this.onShiftScene (scene, event);
        return;
    }
    
    if (!event.isDown () || !this.model.canSelectedTrackHoldNotes ())
        return;
    AbstractSequencerView.prototype.onScene (this, scene, event);
    displayNotification (this.resolutionsStr[this.selectedIndex]);
};

BaseSequencerView.prototype.updateSceneButtons = function ()
{
    if (this.surface.isShiftPressed ())
        return;
    
    var isKeyboardEnabled = this.model.canSelectedTrackHoldNotes ();
    for (var i = 0; i < 8; i++)
    {
        this.surface.updateButton (APC_BUTTON_SCENE_BUTTON1 + i, isKeyboardEnabled && i == (7 - this.selectedIndex) ? APC_BUTTON_STATE_ON : APC_BUTTON_STATE_OFF);
        this.surface.updateButton (APC_BUTTON_TRACK_BUTTON1 + i, APC_BUTTON_STATE_OFF);
    }
};
