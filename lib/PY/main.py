from PyQuery import PQ

def uiAdderClickCallback(this):
	body.append('<p class="counter"></p>')
	counter = PQ('.counter').html('and this one').attr("isTheLatest","false").css({'cursor':'crosshair'})
	lastChild = PQ('.counter:last-child()')
	lastChild.attr('isTheLatest',True)
	lastChild.html('and this last one')
	lastChild.css({'padding-left': '%ipx' % (int(counter.size()))})
	lastChild.makeCallback('click', counterClickCallback)
	
def counterClickCallback(this):
	print('the statement I am the latest is %s for %s' % (this.attr('isTheLatest'), this.get_selector()))
	PQ.command('alert',{'msg':'%s has a left padding of %s' % (this.html(), this.css('padding-left'))})

def doomButtonCallback(this):
	PQ.command('alert',{'msg':'YOU KILLED ME MAN!!! WHAT DID I DO TO DESERVE THIS!!'})
	PQ.command('killMe')
	
body=PQ('body')
body.append('This is a message from your lord Python<br/>All your GUIs are belong to us now')
body.append('</br><button id="UIAdder">Including this one</button>')
uiAdder = PQ('#UIAdder').makeCallback('click', uiAdderClickCallback)
body.append('<button id="endThis">Do Not Press Me</button')
PQ('#endThis').css({"float":"right"}).makeCallback('click', doomButtonCallback)
PQ('button').css({'padding':'20px','background-color':'red'})
body.append('<style id="style"></style>')
style = PQ('#style').append('''
p:hover{
	background-color:lightBlue;
	color:darkBlue;
}
''')

PQ.start()