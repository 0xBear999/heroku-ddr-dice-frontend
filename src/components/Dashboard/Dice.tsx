/* eslint-disable @next/next/no-img-element */
import React, { useMemo, useCallback } from 'react';
export default function Dice1() {

    return (

        <div className="diceWrap">
            <div className="dice" id="dice">
                <div className="diceFace front">
                    <img src='./img/side1.png' className='diceSideImg' alt='side1' />
                </div>
                <div className="diceFace up">
                    <img src='./img/side2.png' className='diceSideImg' alt='side2' />

                </div>
                <div className="diceFace left">
                    <img src='./img/side3.png' className='diceSideImg' alt='side3' />
                </div>
                <div className="diceFace right">
                    <img src='./img/side4.png' className='diceSideImg' alt='side4' />
                </div>
                <div className="diceFace bottom">
                    <img src='./img/side5.png' className='diceSideImg' alt='side5' />
                </div>
                <div className="diceFace back">
                    <img src='./img/side6.png' className='diceSideImg' alt='side6' />
                </div>
            </div>
        </div>

    )
}

