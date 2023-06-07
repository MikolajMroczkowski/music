shiftToSemitones = shift => -12*Math.log2(1/shift)
shuffle = unshuffled =>unshuffled
    .map(value => ({ value, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ value }) => value)
var pitchShift = new Tone.PitchShift({
    pitch: shiftToSemitones(1)*-1,
    windowSize:0.08
}).toDestination();
let player = {disconnect:()=>{}}
let pitch = 0;
let pbr = 1;
let initPlay = false
let info = []
let music = {}
let now = 0;
async function addFile() {
    for (let i = 0; i < document.querySelector("input[type=file]").files.length; i++) {
        const file = document.querySelector("input[type=file]").files[i];
        const reader = new FileReader();
        reader.addEventListener(
            "load",
            () => {
                const index = "/file"+(info.length+1)
                info.push({memory:index,name:file.name})
                music.put("/info.json",new Response(JSON.stringify(info)))
                music.put(index,new Response(reader.result))

            },
            false
        );

        if (file) {
            reader.readAsDataURL(file);
        }
    }
    await load()

}

async function load(){
     music = await caches.open('music');
    const request = '/info.json';
    const response = await music.match(request);
    info = await response.json()
    info = info.reverse()
    console.log(info)
    render()

}
function render(){
    const list = document.getElementById("list")
    list.innerText=""
    for (let i = 0; i < info.length; i++) {
        list.innerHTML+=(`<li onclick="getTrack(${i})">${info[i].name}</li>`)
    }
}
function play () {
    if(initPlay){
        player.restart()
        Tone.Transport.start()
        player.playbackRate = pbr
        //initPlay = false
    }
    else{

    }
}
function speed(s){
    player.playbackRate = s
    pitchShift.pitch = (shiftToSemitones(s)*-1)+pitch
    pbr = s
}
function pitchP(p) {
    console.log(p)
    pitchShift.pitch = parseFloat(pitchShift.pitch) - parseFloat(pitch)
    pitch = parseFloat(p)
    pitchShift.pitch = parseFloat(pitchShift.pitch) + parseFloat(pitch)
    console.log("Pitch: ",parseFloat(pitchShift.pitch))
}
function changePitch(e){
    pitchP(e.value)
}
function track(t){
    trackS = t
    player.disconnect()
    player = new Tone.Player(t);
    player.buffer.onload = () =>{
        initPlay = true
        player.connect(pitchShift);
        player.sync().start(0);
        play()
    }
}
function changeSpeed(e) {
   speed(e.value/100)
}
async function getTrack(i){
    const a = info[i]
    document.getElementById("np").innerText = a.name
    const id = a.memory
    music = await caches.open('music');
    const request =id;
    const response = await music.match(request);
    track(await response.text())
}
async function next() {
    if(now>=info.length){
        now = 0
    }
    getTrack(now)
    now++
}
function changePB(e) {
    pitchShift.pitch=0
    player.playbackRate=e.value/100
    pbr = e.value/100
}
load().then((e)=>{
    next()
})
