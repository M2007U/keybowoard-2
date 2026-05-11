//---- ---- ---- ---- function declare

//getElementbyID but shorter
function POwO_docgetel(InString)
{
    return document.getElementById(InString);
}

//math clamping
function POwO_Math_Clamp(InMin, InVal, InMax)
{
    
    //return Math.max(InMin, Math.min(InVal, InMax) );
    if (InVal > InMax)
    {
        return InMax;
    }
    else if (InVal < InMin)
    {
        return InMin;
    }
    else
    {
        return InVal;
    }

}

//math lerping
function POwO_Math_LERP(A, B, t)
{
    return (B-A) * t + A
}

//math lerping rev
function POwO_Math_LERPinv(A,B,V)
{
    let ReturnResult = 0;

    if (A==B)
    {
        ReturnResult = A;
    }
    else
    {
        ReturnResult = (V-A) / (B-A) 
    }
    
    return ReturnResult;
}

//math lerp Mapping
function POwO_Math_LERPmap(a,b,v,A,B)
{
    let t = POwO_Math_LERPinv(a,b,v);
    return POwO_Math_LERP(A,B,t);
}

//configure the frequency for all notes
//this will only affect the main array, not the other Freq lists
//refer to var declarations
function POwO_setOscFreq()
{
    GLOBAL_freq = [];
    GLOBAL_freqFund = field_osc_fund.value;
    GLOBAL_layout = field_osc_layout.value;
    GLOBAL_edo = field_osc_edo.value;
    GLOBAL_freq_facX = field_osc_freqX.value;
    GLOBAL_freq_facY = field_osc_freqY.value;
    GLOBAL_freq_edoX = field_osc_edoX.value;
    GLOBAL_freq_edoY = field_osc_edoY.value;
    GLOBAL_freq_octClampX = field_osc_octClampX.checked;
    GLOBAL_freq_octClampY = field_osc_octClampY.checked;
    GLOBAL_freq_octClampXY = field_osc_octClampXY.checked;
    
    //deal with the main array first
    //append new frequencies
    if (GLOBAL_layout === "1D")
    {
        for(let i = 0 ; i < Array_Rectangles.length ; i++)
        {
            GLOBAL_freq.push(GLOBAL_freqFund * (2 ** (i/GLOBAL_edo)))
        }
        console.log("freq set : 1D ",GLOBAL_freq)
    }
    else if (GLOBAL_layout === "2Dfrq" || GLOBAL_layout === "2Dedo")
    {
        //if we use 2Dfreq
        //when i = 0 : facX * (CoordY ^ -1) //up down
        //when j = 0 : facY * (CoordX ^ -4) //left right

        //if we use 2Dedo
        //when i = 0 : (2 ^ (edoX / edo)) * (CoordY ^ -1) //up down
        //when j = 0 : (2 ^ (edoY / edo)) * (CoordX ^ -4) //left right

        for(let i = 0 ; i < GLOBAL_Latice_Height ; i++) //for every row
        {
            //what is the relationship along the Y direction ?
            let newFactorY;
            if (GLOBAL_layout === "2Dfrq")
            {
                newFactorY = GLOBAL_freq_facY ** (i-1);
            }
            else if (GLOBAL_layout === "2Dedo")
            {
                newFactorY = ( 2 ** (GLOBAL_freq_edoY / GLOBAL_edo) ) ** (i-1);
            }

            for(let j = 0 ; j < GLOBAL_Latice_Width ; j++) //for every button in a row
            {
                //what is the relationship between along the X direction
                let newFactorX;
                if (GLOBAL_layout === "2Dfrq")
                {
                    newFactorX = GLOBAL_freq_facX ** (j-4);
                }
                else if (GLOBAL_layout === "2Dedo")
                {
                    newFactorX = ( 2 ** (GLOBAL_freq_edoX / GLOBAL_edo) ) ** (j-4)
                }
                
                //do we need to clamp them in the same octave ?
                if (GLOBAL_freq_octClampX)
                {
                    while( (newFactorX !== 0 && newFactorX < 1) || 2 <= newFactorX )
                    {
                        if (newFactorX < 1)
                        {
                            newFactorX = newFactorX * 2;
                        }
                        else if (2 <= newFactorX)
                        {
                            newFactorX = newFactorX / 2;
                        }
                    }
                }
                if (GLOBAL_freq_octClampY)
                {
                    while( (newFactorY !== 0 && newFactorY < 1) || 2 <= newFactorY )
                    {
                        if (newFactorY < 1)
                        {
                            newFactorY = newFactorY * 2;
                        }
                        else if (2 <= newFactorY)
                        {
                            newFactorY = newFactorY / 2;
                        }
                    }
                }

                //for a note say at position i and j, what is the total amount of factor ?
                let newFactorXY = newFactorX * newFactorY

                //do we need to clamp it ?
                if (GLOBAL_freq_octClampXY)
                {
                    while( (newFactorXY !== 0 && newFactorXY < 1) || 2 <= newFactorXY )
                    {
                        if (newFactorXY < 1)
                        {
                            newFactorXY = newFactorXY * 2;
                        }
                        else if (2 <= newFactorXY)
                        {
                            newFactorXY = newFactorXY / 2;
                        }
                    }
                }

                //apply it
                GLOBAL_freq.push( GLOBAL_freqFund * newFactorXY)
            }
        }
    }
    else if (GLOBAL_layout === "explicit")
    {
        let tempArray = field_osc_freqL.value.split(",");
        for(let i = 0 ; i < tempArray.length ; i++)
        {
            tempArray[i] = Number(tempArray[i])
        }

        if ( tempArray.length === Array_AudioNodes_osc.length)
        {
            GLOBAL_freq = tempArray;
            console.log(GLOBAL_freq)
        }
        else
        {
            alert("explicit list length : " + tempArray.length.toString() + " !== 32");
        }
    }

    //set the freqwuencies to the oscs
    for(let i = 0 ; i < Array_AudioNodes_osc.length ; i++)
    {
        Array_AudioNodes_osc[i].frequency.setValueAtTime(GLOBAL_freq[i],adkt.currentTime)
    }

    //write the freqs to the FreqLists based on the ListIndex
    POwO_fromMainFreqToListFreq(GLOBAL_freq_Index)

    //need to make sure that the freqs are correct
    for(let i = 0 ; i < Array_AudioNodes_osc.length ; i++)
    {
        console.log((Array_AudioNodes_osc[i].frequency.value))
    }

    POwO_RectangleTextPinPoint()
}

//copies the frequencies from the Main working Array to the List Array based on the given Index
function POwO_fromMainFreqToListFreq( InIndex )
{
    if (InIndex == 0)
    {
        for(let i = 0 ; i < Array_Rectangles.length ; i++)
        {
            GLOBAL_freq_List0.push(GLOBAL_freq[i])
        }

        while(GLOBAL_freq_List0.length > Array_Rectangles.length)
        {
            GLOBAL_freq_List0.shift()
        }
    }
    else if (InIndex == 1)
    {
        for(let i = 0 ; i < GLOBAL_freq.length ; i++)
        {
            GLOBAL_freq_List1.push(GLOBAL_freq[i])
        }

        while(GLOBAL_freq_List1.length > Array_Rectangles.length)
        {
            GLOBAL_freq_List1.shift()
        }
    }
    else if (InIndex == 2)
    {
        for(let i = 0 ; i < GLOBAL_freq.length ; i++)
        {
            GLOBAL_freq_List2.push(GLOBAL_freq[i])
        }

        while(GLOBAL_freq_List2.length > Array_Rectangles.length)
        {
            GLOBAL_freq_List2.shift()
        }
    }
    else if (InIndex == 3)
    {
        for(let i = 0 ; i < GLOBAL_freq.length ; i++)
        {
            GLOBAL_freq_List3.push(GLOBAL_freq[i])
        }

        while(GLOBAL_freq_List3.length > Array_Rectangles.length)
        {
            GLOBAL_freq_List3.shift()
        }
    }
}

//refer to the previous function, but the other way around
function POwO_fromListFreqToMainFreq( InIndex )
{
    if (InIndex == 0)
    {
        for(let i = 0 ; i < Array_Rectangles.length ; i++)
        {
            GLOBAL_freq.push(GLOBAL_freq_List0[i]);
        }
    }
    else if (InIndex == 1)
    {
        for(let i = 0 ; i < Array_Rectangles.length ; i++)
        {
            GLOBAL_freq.push(GLOBAL_freq_List1[i]);
        }
    }
    else if (InIndex == 2)
    {
        for(let i = 0 ; i < Array_Rectangles.length ; i++)
        {
            GLOBAL_freq.push(GLOBAL_freq_List2[i]);
        }
    }
    else if (InIndex == 3)
    {
        for(let i = 0 ; i < Array_Rectangles.length ; i++)
        {
            GLOBAL_freq.push(GLOBAL_freq_List3[i]);
        }
    }

    //make sure the length is correct
    while(GLOBAL_freq.length > Array_Rectangles.length)
    {
        GLOBAL_freq.shift()
    }

    //set the freqwuencies to the oscs
    // only if the given value is valid, not undefine, like when the user is setting up the stage, there will be a lot of undefined values
    for(let i = 0 ; i < Array_AudioNodes_osc.length ; i++)
    {
        if (GLOBAL_freq[i] === undefined)
        {
            console.log("<!> osc[" + i + "].freq is undef")
        }
        else
        {
            Array_AudioNodes_osc[i].frequency.setValueAtTime(GLOBAL_freq[i],adkt.currentTime)
        }
    }

    //change the label
    field_osc_freqIndex.textContent = InIndex;

}

function POwO_printFreqsAll()
{
    console.log("---- ---- ---- ---- Print Freq All")
    console.log(GLOBAL_freq)
    console.log(GLOBAL_freq_Index)
    console.log(GLOBAL_freq_List0)
    console.log(GLOBAL_freq_List1)
    console.log(GLOBAL_freq_List2)
    console.log(GLOBAL_freq_List3)
    console.log("\n\n\n")
}

//configure the wave type for all notes
function POwO_setOscType(Instring)
{
    for(let i = 0 ; i < Array_AudioNodes_osc.length ; i++)
    {
        Array_AudioNodes_osc[i].type = Instring;
    }

    field_osc_type.textContent = Instring;
}

//power on
async function POwO_adktSetup()
{
    //start the adkt
    await adkt.resume();

    //deal with oscilator
    POwO_setOscType("square")
    for(var i  = 0; i < Array_AudioNodes_adsr.length ; i++)
    {
        Array_AudioNodes_adsr[i].gain.setValueAtTime(0,adkt.currentTime);
    }
    POwO_setOscFreq(GLOBAL_freq, GLOBAL_layout,  GLOBAL_freqFund, GLOBAL_edo, GLOBAL_freq_facX , GLOBAL_freq_facY, [] , Array_AudioNodes_osc);
    

    //deal with filter
    AudioNodes_filter[0].gain.setValueAtTime(1,adkt.currentTime);
    AudioNodes_filter[1].type = 'lowpass';  AudioNodes_filter[1].frequency.setValueAtTime(20000   ,adkt.currentTime);    AudioNodes_filter[1].Q.setValueAtTime(1,adkt.currentTime);
    AudioNodes_filter[2].type = 'highpass'; AudioNodes_filter[2].frequency.setValueAtTime(0       ,adkt.currentTime);    AudioNodes_filter[2].Q.setValueAtTime(1,adkt.currentTime);
    AudioNodes_filter[3].type = 'lowshelf'; AudioNodes_filter[3].frequency.setValueAtTime(20000   ,adkt.currentTime);    AudioNodes_filter[3].gain.setValueAtTime(0,adkt.currentTime);
    AudioNodes_filter[4].type = 'highshelf';AudioNodes_filter[4].frequency.setValueAtTime(0       ,adkt.currentTime);    AudioNodes_filter[4].gain.setValueAtTime(0,adkt.currentTime);

    AudioNodes_gain.gain.setValueAtTime(0.1,adkt.currentTime);

    

    //connect everything
    for(let i = 0 ; i < Array_AudioNodes_osc.length ; i++)
    {
        Array_AudioNodes_osc[i].connect( Array_AudioNodes_adsr[i] );
        Array_AudioNodes_adsr[i].connect( AudioNodes_filter[0] );
    }
    for(let i = 0 ; i < AudioNodes_filter.length - 1 ; i++)
    {
        AudioNodes_filter[i].connect(AudioNodes_filter[i+1]);
    }
    AudioNodes_filter[5].connect(AudioNodes_gain)
    AudioNodes_gain.connect(adkt.destination);

    //start all the oscillators
    for(let i = 0 ; i < Array_AudioNodes_osc.length ; i++)
    {
        Array_AudioNodes_osc[i].start();
    }

    // connect successfuly, ready
    console.log("READY")
    field_adktSetup.style.color = "#006000"
    isREADY = true;

}

//piano keypress
function POwO_musicButtonDown(InString)
{
    for(let i = 0 ; i < Array_KeyPressString.length ; i++)
    {
        if (InString === Array_KeyPressString[i])
        {
            Array_KeyPressDetect[i] = 1;
        }
    }

    POwO_canvas_draw(POwO_canvas_collect())
}

//piano keyrelease
function POwO_musicButtonUp(InString)
{
    for(let i = 0 ; i < Array_KeyPressString.length ; i++)
    {
        if (InString === Array_KeyPressString[i])
        {
            Array_KeyPressDetect[i] = 0;
        }
    }

    POwO_canvas_draw(POwO_canvas_collect())
}

function POwO_RectangleTextPinPoint()
{
    for(let i = 0 ; i < Array_Rectangles.length ; i++)
    {
        if (Math.abs(GLOBAL_freq[i] - GLOBAL_freqFund) < 0.001 )
        {
             Array_Rectangles[i].textContent = "[ " + Array_KeyPressString[i] + " ]"
        }
        else
        {
             Array_Rectangles[i].textContent = Array_KeyPressString[i]
        }
    }
}

//multiply all notes by a given factor
function POwO_musicAllNotesMigrate( InFactor )
{
    console.log("Migrate : " + InFactor.toString())
    console.log(GLOBAL_freq)
    for(let i = 0 ; i < GLOBAL_freq.length ; i++)
    {
        GLOBAL_freq[i] = GLOBAL_freq[i] * InFactor;
        Array_AudioNodes_osc[i].frequency.setValueAtTime(GLOBAL_freq[i],adkt.currentTime);
        console.log("New Freq : " + Array_AudioNodes_osc[i].frequency)
    }

    POwO_RectangleTextPinPoint()
}

function POwO_control_ModL()
{
    CONTROL_index_0 = (CONTROL_index_0 + (CONTROL_param.length - 1) ) % CONTROL_param.length;
    CONTROL_index_1 = 0;
    POwO_control_CurrentChoicePrint();
}

function POwO_control_ModR()
{
    CONTROL_index_0 = (CONTROL_index_0 + 1) % CONTROL_param.length;
    CONTROL_index_1 = 0;
    POwO_control_CurrentChoicePrint();
}

function POwO_control_PrmL()
{
    CONTROL_index_1 = (CONTROL_index_1 + (CONTROL_param[CONTROL_index_0].length - 1)) % CONTROL_param[CONTROL_index_0].length;
    POwO_control_CurrentChoicePrint();
}

function POwO_control_PrmR()
{
    CONTROL_index_1 = (CONTROL_index_1 + 1) % CONTROL_param[CONTROL_index_0].length;
    POwO_control_CurrentChoicePrint();
}

function POwO_control_Change(InDirection)
{
    let Direction = 1;
    if (InDirection === "+")
    {
        Direction = 1;
    }
    else if (InDirection === "-")
    {
        Direction = -1;
    }

    switch (CONTROL_index_0)
    {
        case 0: //ADSR
            switch (CONTROL_index_1)
            {
                case 0 : GLOBAL_adsr_atk = POwO_Math_Clamp(1/256 , GLOBAL_adsr_atk + GLOBAL_adsr_dlt * Direction , 1);                                              field_adsr_atk.textContent = GLOBAL_adsr_atk.toString();         break;
                case 1 : GLOBAL_adsr_sus = POwO_Math_Clamp(0, GLOBAL_adsr_sus + GLOBAL_adsr_dlt * Direction , 1);                                                   field_adsr_sus.textContent = GLOBAL_adsr_sus.toString();        break;
                case 2 : GLOBAL_adsr_rel = POwO_Math_Clamp(1/256 , GLOBAL_adsr_rel + GLOBAL_adsr_dlt * Direction , 1);                                              field_adsr_rel.textContent = GLOBAL_adsr_rel.toString();        break;
                case 3 : AudioNodes_gain.gain.setValueAtTime(POwO_Math_Clamp(0, AudioNodes_gain.gain.value + GLOBAL_vol_dlt * Direction,1), adkt.currentTime);      field_adsr_vol.textContent = AudioNodes_gain.gain.value.toString();  break;
                default:break;
            }
        break;
        case 1: //FILTER
            switch (CONTROL_index_1)
            {
                case 0 : AudioNodes_filter[1].frequency.setValueAtTime( POwO_Math_Clamp(0,AudioNodes_filter[1].frequency.value + GLOBAL_filter_delta_freq * Direction,20000), adkt.currentTime); field_filter_lowpass_freq.textContent = AudioNodes_filter[1].frequency.value.toString(); break;
                case 2 : AudioNodes_filter[2].frequency.setValueAtTime( POwO_Math_Clamp(0,AudioNodes_filter[2].frequency.value + GLOBAL_filter_delta_freq * Direction,20000), adkt.currentTime); field_filter_hghpass_freq.textContent = AudioNodes_filter[2].frequency.value.toString(); break;
                case 4 : AudioNodes_filter[3].frequency.setValueAtTime( POwO_Math_Clamp(0,AudioNodes_filter[3].frequency.value + GLOBAL_filter_delta_freq * Direction,20000), adkt.currentTime); field_filter_lowshlf_freq.textContent = AudioNodes_filter[3].frequency.value.toString(); break;
                case 6 : AudioNodes_filter[4].frequency.setValueAtTime( POwO_Math_Clamp(0,AudioNodes_filter[4].frequency.value + GLOBAL_filter_delta_freq * Direction,20000), adkt.currentTime); field_filter_hghshlf_freq.textContent = AudioNodes_filter[4].frequency.value.toString(); break;

                case 1 : AudioNodes_filter[1].Q     .setValueAtTime( POwO_Math_Clamp(1,AudioNodes_filter[1].Q.value + GLOBAL_filter_delta_qval * Direction,1000), adkt.currentTime); field_filter_lowpass_reso.textContent = AudioNodes_filter[1].Q.value.toString(); break;
                case 3 : AudioNodes_filter[2].Q     .setValueAtTime( POwO_Math_Clamp(1,AudioNodes_filter[2].Q.value + GLOBAL_filter_delta_qval * Direction,1000), adkt.currentTime); field_filter_hghpass_reso.textContent = AudioNodes_filter[2].Q.value.toString(); break;
                case 5 : AudioNodes_filter[3].gain  .setValueAtTime( POwO_Math_Clamp(-8,AudioNodes_filter[3].gain.value + GLOBAL_filter_delta_decb * Direction,8), adkt.currentTime); field_filter_lowshlf_gain.textContent = AudioNodes_filter[3].gain.value.toString(); break;
                case 7 : AudioNodes_filter[4].gain  .setValueAtTime( POwO_Math_Clamp(-8,AudioNodes_filter[4].gain.value + GLOBAL_filter_delta_decb * Direction,8), adkt.currentTime); field_filter_hghshlf_gain.textContent = AudioNodes_filter[4].gain.value.toString(); break;
            
                default:
                    break;
            }
        break;
        default:
        break;
    }
}

function POwO_control_CurrentChoicePrint()
{
    console.log(CONTROL_index_0);
    console.log(CONTROL_index_1);
    field_control_currentChoice.textContent = CONTROL_param[CONTROL_index_0][CONTROL_index_1];
}

function POwO_interface_ToggleText()
{
    if (Array_Rectangles[0].textContent === "z")
    {
        for (let i = 0 ; i < Array_Rectangles.length ; i++)
        {
            Array_Rectangles[i].textContent = ""
        }
    }
    else
    {
        for (let i = 0 ; i < Array_Rectangles.length ; i++)
        {
            Array_Rectangles[i].textContent = Array_KeyPressString[i]
        }
        Array_Rectangles[11].textContent = "[f]"
    }
}

//take degrees as arguments, like in trigonometry
function POwO_canvas_draw(InArray)
{
    //setup
    let Kanvas = POwO_docgetel("kanvas");
    let KanvasContext = Kanvas.getContext("2d");
    KanvasContext.clearRect(0, 0, Kanvas.width, Kanvas.height)
    let cx = Kanvas.width / 2;
    let cy = Kanvas.height / 2;
    let RadiusBig = 0;
    let RadiusSmol = 0;

    //draw ring
    RadiusBig = 200;
    KanvasContext.lineWidth = 1;        // ring thickness
    KanvasContext.strokeStyle = "rgba(" + COLOR_MAIN + ",0.5)"  // ring color
    KanvasContext.beginPath();
    KanvasContext.arc(cx, cy, RadiusBig, 0, Math.PI * 2);
    KanvasContext.stroke();

    //draw smaller circles
    //at the same time, collect positions for polygon
    RadiusSmol = 25;
    KanvasContext.fillStyle = "rgba(" + COLOR_MAIN + ",1)"
    let temp_polygon_pos = []
    for(let i = 0 ; i < InArray.length ; i++)
    {
        let DegInRad = InArray[i] / 180 * Math.PI;
        let temp_thisX = cx + Math.cos(DegInRad) * RadiusBig
        let temp_thisY = cy - Math.sin(DegInRad) * RadiusBig
        temp_polygon_pos.push( [temp_thisX,temp_thisY] )

        if (field_visual_chord_dott.checked)
        {
            KanvasContext.beginPath();
            KanvasContext.arc(temp_thisX, temp_thisY, RadiusSmol, 0, Math.PI * 2);
            KanvasContext.stroke();  
            KanvasContext.fill()
        }
    }

    //now draw polygon
    if (temp_polygon_pos.length > 0)
    {
        KanvasContext.beginPath()
        KanvasContext.moveTo( temp_polygon_pos[0][0] , temp_polygon_pos[0][1] ) //begining position
        for(let i = 1 ; i < temp_polygon_pos.length; i++)
        {
            KanvasContext.lineTo(temp_polygon_pos[i][0], temp_polygon_pos[i][1])
        }
        KanvasContext.closePath()
        if (field_visual_chord_fill.checked)
        {
            KanvasContext.fillStyle = "rgba(" + COLOR_MAIN + ",0.25)"
            KanvasContext.fill()
        }
        if (field_visual_chord_line.checked)
        {
            KanvasContext.strokeStyle = "rgba(" + COLOR_MAIN + ",0.5)"
            KanvasContext.lineWidth = 1
            KanvasContext.stroke()
        }


    }
}

//collect the pressed frequencies, turn them into angles, and return them as an array
function POwO_canvas_collect()
{
    let OutArray = [];

    for(let i = 0 ; i < Array_KeyPressDetect.length ; i++)
    {
        //if it is pressed, got freq will be multiplied by 1, else 0
        let FreqGot = Array_KeyPressDetect[i] * Array_AudioNodes_osc[i].frequency.value

        //what is the factor of it compared to the fund freq
        let FactorGot = FreqGot / GLOBAL_freqFund

        //log it
        let Logarithm = Math.log2(FactorGot)

        //get the fraction
        let LERPt = Logarithm % 1;

        //turn it into Degrees
        //here we use lerp mapping
        let DegRes = POwO_Math_LERPmap(0,1,LERPt,0,360)
        DegRes += 360
        DegRes = DegRes % 360

        if (isNaN(DegRes))
        {
            
        }
        else
        {
            OutArray.push(DegRes)
        }
        
    }

    OutArray.sort(function(a, b) {return a - b;});//so that the polygon will not twist
    return OutArray;
}







//---- ---- ---- ---- global vars

//html css related stuff
var COLOR_ON = "1"
var COLOR_OFF = "0.1"
var COLOR_MAIN = "255,192,0"
var Array_KeyPressString =
[
    "z","x","c","v","b","n","m",",",".","/",
    "a","s","d","f","g","h","j","k","l",";",
    "q","w","e","r","t","y","u","i","o","p",
    "1","2","3","4","5","6","7","8","9","0"
]
var Array_SettingsString =
[   "oct ↓",    "oct ↑",    "\u00A0","\u00A0","mod ←","prm ←","prm ↓","prm ↑","prm →","mod →",
    "edo ←",    "edo ↓",    "edo →","frq ←","frq ↓","frq →","\u00A0","\u00A0","\u00A0","\u00A0",
    "edo -",   "edo ↑",    "edo +","\u00A0","frq ↑","\u00A0","\u00A0","\u00A0","\u00A0","\u00A0",
    "◯",       "△",       "◺","▢","set0","set1","set2","set3","\u00A0","hde/shw"
]
var Array_Rectangles =
[
    POwO_docgetel("rec_00") , POwO_docgetel("rec_01") , POwO_docgetel("rec_02") , POwO_docgetel("rec_03") , POwO_docgetel("rec_04") ,
    POwO_docgetel("rec_05") , POwO_docgetel("rec_06") , POwO_docgetel("rec_07") , POwO_docgetel("rec_08") , POwO_docgetel("rec_09") ,

    POwO_docgetel("rec_10") , POwO_docgetel("rec_11") , POwO_docgetel("rec_12") , POwO_docgetel("rec_13") , POwO_docgetel("rec_14") ,
    POwO_docgetel("rec_15") , POwO_docgetel("rec_16") , POwO_docgetel("rec_17") , POwO_docgetel("rec_18") , POwO_docgetel("rec_19") ,

    POwO_docgetel("rec_20") , POwO_docgetel("rec_21") , POwO_docgetel("rec_22") , POwO_docgetel("rec_23") , POwO_docgetel("rec_24") ,
    POwO_docgetel("rec_25") , POwO_docgetel("rec_26") , POwO_docgetel("rec_27") , POwO_docgetel("rec_28") , POwO_docgetel("rec_29") ,

    POwO_docgetel("rec_30") , POwO_docgetel("rec_31") , POwO_docgetel("rec_32") , POwO_docgetel("rec_33") , POwO_docgetel("rec_34") ,
    POwO_docgetel("rec_35") , POwO_docgetel("rec_36") , POwO_docgetel("rec_37") , POwO_docgetel("rec_38") , POwO_docgetel("rec_39")

] //every square grid you see at the screen, 4x8=32 of them
var Array_KeyPressDetect = []; //we use this to detect if a key is pressed or released, (released is 0, pressed is 1)
for(let i = 0 ; i < Array_KeyPressString.length ; i ++)
{
    //for now, fill it up with 32 '0's
    Array_KeyPressDetect.push(0);
}

const btn_freqconfig = POwO_docgetel("btn_freqconfig")
const btn_adktSetup = POwO_docgetel("btn_adktSetup")

const field_osc_octave  = POwO_docgetel("field_osc_octave")
const field_osc_edotone = POwO_docgetel("field_osc_edotone")
const field_osc_freqoff = POwO_docgetel("field_osc_freqoff")
const field_osc_type    = POwO_docgetel("field_osc_type")
const field_osc_edo     = POwO_docgetel("field_osc_edo")
const field_osc_layout  = POwO_docgetel("field_osc_layout") //which layout we are using ? 1D ? 2Dfreq ? 2Dedo ? explicit ?
const field_osc_freqIndex = POwO_docgetel("field_osc_freqIndex") //choose which freqList we are using, 0~3
const field_osc_fund    = POwO_docgetel("field_osc_fund")
const field_osc_freqX   = POwO_docgetel("field_osc_freqX")
const field_osc_freqY   = POwO_docgetel("field_osc_freqY")
const field_osc_edoX    = POwO_docgetel("field_osc_edoX")
const field_osc_edoY    = POwO_docgetel("field_osc_edoY")
const field_osc_octClampX = POwO_docgetel("field_osc_octClampX")
const field_osc_octClampY = POwO_docgetel("field_osc_octClampY")
const field_osc_octClampXY = POwO_docgetel("field_osc_octClampXY")
const field_osc_freqL   = POwO_docgetel("field_osc_freqL")

const field_adsr_atk = POwO_docgetel("field_adsr_atk");
const field_adsr_sus = POwO_docgetel("field_adsr_sus");
const field_adsr_rel = POwO_docgetel("field_adsr_rel");
const field_adsr_vol = POwO_docgetel("field_adsr_vol");

const field_filter_lowpass_freq = POwO_docgetel("field_filter_lowpass_freq");
const field_filter_lowpass_reso = POwO_docgetel("field_filter_lowpass_reso");
const field_filter_hghpass_freq = POwO_docgetel("field_filter_hghpass_freq");
const field_filter_hghpass_reso = POwO_docgetel("field_filter_hghpass_reso");
const field_filter_lowshlf_freq = POwO_docgetel("field_filter_lowshlf_freq");
const field_filter_lowshlf_gain = POwO_docgetel("field_filter_lowshlf_gain");
const field_filter_hghshlf_freq = POwO_docgetel("field_filter_hghshlf_freq");
const field_filter_hghshlf_gain = POwO_docgetel("field_filter_hghshlf_gain");

const field_visual_color_main = POwO_docgetel("field_visual_color_main");
const field_visual_color_bg = POwO_docgetel("field_visual_color_bg");
const field_visual_chord_dott = POwO_docgetel("field_visual_chord_dott")
const field_visual_chord_line = POwO_docgetel("field_visual_chord_line")
const field_visual_chord_fill = POwO_docgetel("field_visual_chord_fill")

const field_control_currentChoice = POwO_docgetel("CONTROL_print")
const field_adktSetup = POwO_docgetel("field_adktSetup")


//frequency related stuffs
var GLOBAL_edo = 12;
var GLOBAL_freqFund = 523.2511; //C5
var GLOBAL_layout = "1D" //can be 1D or 2D
var GLOBAL_freq_facX = 1.5;
var GLOBAL_freq_facY = 1.25;
var GLOBAL_freq_edoX = 4;
var GLOBAL_freq_edoY = 1; 
var GLOBAL_freq_octClampX = false;
var GLOBAL_freq_octClampY = false;
var GLOBAL_freq_octClampXY = false;
var GLOBAL_Latice_Width = 10;
var GLOBAL_Latice_Height = 4;
if (GLOBAL_Latice_Height * GLOBAL_Latice_Width !== Array_Rectangles.length){console.log("warning : GLOBAL_Latice_Width and GLOBAL_Latice_Height might be wrong, var declaration")}
var GLOBAL_freq = [];
var GLOBAL_freq_Index = 0; //to know which freq List is the user using
var GLOBAL_freq_List0 = []; //these are like frequency presets defined by users
var GLOBAL_freq_List1 = []; //these lists can be accessed by pressing 'o','p','[',']'
var GLOBAL_freq_List2 = [];
var GLOBAL_freq_List3 = [];

//adsr related stuffs
var GLOBAL_adsr_atk = 1;
var GLOBAL_adsr_sus = 1;
var GLOBAL_adsr_rel = 1;
var GLOBAL_adsr_dlt = 1/256;

//main volume
var GLOBAL_vol_dlt = 1/256;

//filter
var GLOBAL_filter_delta_freq = 10;
var GLOBAL_filter_delta_qval = 1;
var GLOBAL_filter_delta_decb = 1/16;




//---- ---- ---- ---- construct audio context

//audio context
var isREADY = false;
const adkt = new (window.AudioContext || window.webkitAudioContext)();
console.log("new audioKontext");



const adkt_dummy_osc  = adkt.createOscillator();
const adkt_dummy_adsr = adkt.createGain();



//oscilators
var Array_AudioNodes_osc = []
for(let i = 0 ; i < Array_Rectangles.length ; i++){
    Array_AudioNodes_osc.push(adkt.createOscillator());
}

//adsr
var Array_AudioNodes_adsr = []
for(let i = 0 ; i < Array_Rectangles.length ; i++){
    Array_AudioNodes_adsr.push(adkt.createGain());
}

//filter node
var AudioNodes_filter =[
    adkt.createGain(), //in
    adkt.createBiquadFilter(), //pass low
    adkt.createBiquadFilter(), //pass high
    adkt.createBiquadFilter(), //shlf low
    adkt.createBiquadFilter(), //shlf high
    adkt.createGain() //out
]


//main volume
var AudioNodes_gain = adkt.createGain()


//Settings Array
var CONTROL_param =
[
    [
        "ADSR > attack",
        "ADSR > sustain",
        "ADSR > release",
        "ADSR > overall"
    ],
    [
        "FILTER > lowpass > frequency",
        "FILTER > lowpass > resonance",
        "FILTER > highpass > frequency",
        "FILTER > highpass > resonance",
        "FILTER > lowshelf > frequency",
        "FILTER > lowshelf > gain",
        "FILTER > highshelf > frequency",
        "FILTER > highshelf > gain"
    ]
]
let CONTROL_index_0 = 0;
let CONTROL_index_1 = 3;




//---- ---- ---- ---- InterfaceControl

function POwO_InterfaceControl_Down(InString)
{
    console.log("got Interface : " + InString)

    POwO_musicButtonDown(InString);

    switch (InString) {
        case "=" : POwO_adktSetup() ; break ;
        case "-" : POwO_setOscFreq() ; POwO_printFreqsAll() ; field_osc_edotone.textContent = 0 ; field_osc_edotone.textContent = 1 ; break ;

        case "!" : POwO_setOscType("sine") ; break ;
        case "@" : POwO_setOscType("triangle") ; break ;
        case "#" : POwO_setOscType("sawtooth") ; break ;
        case "$" : POwO_setOscType("square") ; break ;

        case "%" : GLOBAL_freq_Index = 0; POwO_fromListFreqToMainFreq(0); POwO_printFreqsAll() ; break ;
        case "^" : GLOBAL_freq_Index = 1; POwO_fromListFreqToMainFreq(1); POwO_printFreqsAll() ; break ;
        case "&" : GLOBAL_freq_Index = 2; POwO_fromListFreqToMainFreq(2); POwO_printFreqsAll() ; break ;
        case "*" : GLOBAL_freq_Index = 3; POwO_fromListFreqToMainFreq(3); POwO_printFreqsAll() ; break ;

        case "Z" : POwO_musicAllNotesMigrate(0.5) ; field_osc_octave.textContent = Number(field_osc_octave.textContent)-1 ; break ;
        case "X" : POwO_musicAllNotesMigrate(2) ; field_osc_octave.textContent = Number(field_osc_octave.textContent)+1 ; break ;

        //edo panning
        case "Q" : POwO_musicAllNotesMigrate(1/(2**(1/GLOBAL_edo))) ; field_osc_edotone.textContent = Number(field_osc_edotone.textContent)-1 ; break ;
        case "E" : POwO_musicAllNotesMigrate((2**(1/GLOBAL_edo))) ; field_osc_edotone.textContent = Number(field_osc_edotone.textContent)+1 ; break ;
        case "S" : POwO_musicAllNotesMigrate(1/(2**( GLOBAL_freq_edoY /GLOBAL_edo)))    ; field_osc_edotone.textContent = Number(field_osc_edotone.textContent)-GLOBAL_freq_edoY ; break ;
        case "W" : POwO_musicAllNotesMigrate((2**(GLOBAL_freq_edoY/GLOBAL_edo)))        ; field_osc_edotone.textContent = Number(field_osc_edotone.textContent)+GLOBAL_freq_edoY ; break ;
        case "A" : POwO_musicAllNotesMigrate(1/(2**( GLOBAL_freq_edoX /GLOBAL_edo)))    ; field_osc_edotone.textContent = Number(field_osc_edotone.textContent)-GLOBAL_freq_edoX ; break ;
        case "D" : POwO_musicAllNotesMigrate((2**(GLOBAL_freq_edoX/GLOBAL_edo)))        ; field_osc_edotone.textContent = Number(field_osc_edotone.textContent)+GLOBAL_freq_edoX ; break ;

        //freq panning
        case "G" : POwO_musicAllNotesMigrate(1/GLOBAL_freq_facY)    ; field_osc_freqoff.textContent = Number(field_osc_freqoff.textContent) / GLOBAL_freq_facY ; break ;
        case "T" : POwO_musicAllNotesMigrate(GLOBAL_freq_facY)      ; field_osc_freqoff.textContent = Number(field_osc_freqoff.textContent) * GLOBAL_freq_facY ; break ;
        case "F" : POwO_musicAllNotesMigrate(1/GLOBAL_freq_facX)    ; field_osc_freqoff.textContent = Number(field_osc_freqoff.textContent) / GLOBAL_freq_facX ; break ;
        case "H" : POwO_musicAllNotesMigrate(GLOBAL_freq_facX)      ; field_osc_freqoff.textContent = Number(field_osc_freqoff.textContent) * GLOBAL_freq_facX ; break ;

        case "B" : POwO_control_ModL() ; break ;
        case "N" : POwO_control_PrmL() ; break ;
        case "M" : POwO_control_Change("-") ; break ;
        case "<" : POwO_control_Change("+") ; break ;
        case ">" : POwO_control_PrmR() ; break ;
        case "?" : POwO_control_ModR() ; break ;

        case ")" : POwO_interface_ToggleText() ; break ;
        case "Shift" : for(let i = 0 ; i < Array_Rectangles.length ; i++){ Array_Rectangles[i].textContent = Array_SettingsString[i] } ; break ;

    
        default : break ;
    }


    
    

    //freq panning


    
    
    
}

function POwO_InterfaceControl_Up(InString)
{
    POwO_musicButtonUp(InString);

    if (InString === "Shift"){POwO_RectangleTextPinPoint()}
}





//---- ---- ---- ---- keyboard controls

document.addEventListener("keydown", (event) =>
{
    console.log("got Keypress : " + event.key)
    POwO_InterfaceControl_Down(event.key)

    if (event.key === "/"){event.preventDefault()}
});

document.addEventListener("keyup", (event) =>
{
    POwO_InterfaceControl_Up(event.key)
});



//---- ---- ---- ---- visual stuffs

field_visual_color_main.addEventListener("change",(event) => {
    COLOR_MAIN = field_visual_color_main.value
    let temp_newcolor = "rgba(" + COLOR_MAIN + ",0.1)"

    for(var i = 0 ; i < Array_Rectangles.length ; i++)
    {
        Array_Rectangles[i].style.backgroundColor = temp_newcolor
    }

    btn_adktSetup.style.backgroundColor = temp_newcolor
    btn_freqconfig.style.backgroundColor = temp_newcolor

    console.log("color_main = " + COLOR_MAIN)
})

field_visual_color_bg.addEventListener("change",(event) => {
    document.body.style.backgroundColor = "rgba(" + field_visual_color_bg.value + ")"
})


//---- ---- ---- ---- mobile controls

for(let i = 0 ; i < Array_Rectangles.length ; i++)
{
    Array_Rectangles[i].addEventListener("touchstart",()=>{ POwO_InterfaceControl_Down(Array_KeyPressString[i]); })
    Array_Rectangles[i].addEventListener("touchend",()=>{ POwO_InterfaceControl_Up(Array_KeyPressString[i]); })
}
btn_adktSetup.addEventListener("touchstart" , () => {POwO_InterfaceControl_Down("=")})
btn_freqconfig.addEventListener("touchstart" , () => {POwO_InterfaceControl_Down("-")})


//---- ---- ---- ---- runtime trigger
var ClearConsole_Max = 2000
var ClearConsole_Cur = 2000

setInterval(function(){
    if (isREADY)
    {
        for(var i = 0 ; i < Array_Rectangles.length ; i++)
        {
            var TargetGain = Array_AudioNodes_adsr[i].gain.value;
            if (Array_KeyPressDetect[i] === 1)
            {
                TargetGain = POwO_Math_Clamp(0,TargetGain + GLOBAL_adsr_atk, GLOBAL_adsr_sus);
            }
            else
            {
                TargetGain = POwO_Math_Clamp(0,TargetGain - GLOBAL_adsr_rel,1);
            }

            Array_AudioNodes_adsr[i].gain.setValueAtTime(  TargetGain, adkt.currentTime );

            Array_Rectangles[i].style.backgroundColor = "rgba(" + COLOR_MAIN + "," + (POwO_Math_LERP(0.1,1,TargetGain)).toString() + ")" 
        }
        
    }

    if (ClearConsole_Cur > 0){ClearConsole_Cur --}else{console.clear() ; ClearConsole_Cur = ClearConsole_Max}
},10)