import colors from 'yoctocolors'
import { DreamCliForegroundColor } from '../logger/DreamCliLogger.js'

export default function logo() {
  const color1: DreamCliForegroundColor = 'blueBright'
  const color2: DreamCliForegroundColor = 'magentaBright'

  return (
    colors[color1](
      `
                                     ,▄█▄                  
       ]█▄▄                         ╓█████▌                 
       ▐██████▄                   ▄█████▓╣█                 
       ║████████▄,  ,  ,,▄,▄▄▄▓██████╬╬╣╣▌                 
         ╚███╣██████████▓▓▓▓██████████╩╠╬▓                  
         ╙█╬╬╬▓███████████████████████▒▓▌                  
           ╙▓█▓██████████████████████████                   
           ╚██████▀███████████`
    ) +
    colors[color2](`╩█▓▌`) +
    colors[color1](`▐▓████▄                  
           '║█████`) +
    colors[color2](`\`╣█Γ║`) +
    colors[color1](`████████▄▄φ▓█████▌                  
             ║█████████████████████▓█████▌                  
             █████████████▓▓████████████                   
             ║█████████████████████████                    
             ]█████████████████████████                     
           ,▓██████████████████████████                    
           ▓█████████████████████████████µ                  
         ▐███████████████████████████████▄▄                
         ║█████████████████████████████████╬╬╣▓            
     ,╔╦║███████████████████████████████████▓╬╬╣           
   ,≥≥⌠░░░╠▓████████████████████████████████████▓▓          
   ,;=-',▄█████████████████████████████████████████▓        `) +
    colors[color1](
      `
                                                         
  ██████╗ ███████╗██╗   ██╗ ██████╗██╗  ██╗██╗ ██████╗   
  ██╔══██╗██╔════╝╚██╗ ██╔╝██╔════╝██║  ██║██║██╔════╝   
  ██████╔╝███████╗ ╚████╔╝ ██║     ███████║██║██║        
  ██╔═══╝ ╚════██║  ╚██╔╝  ██║     ██╔══██║██║██║        
  ██║     ███████║   ██║   ╚██████╗██║  ██║██║╚██████╗   
  ╚═╝     ╚══════╝   ╚═╝    ╚═════╝╚═╝  ╚═╝╚═╝ ╚═════╝   
                                                         
                                                         `
    )
  )
}
