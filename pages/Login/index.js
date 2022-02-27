import React from 'react'
import Head from 'next/head'
import Loginusername from '../../components/Utilitty/Loginusername'
const Login = () => {


  return (
    <div className='bg-[#00FFFF]'>
      <Head>
        <title>Login ▫ Instagram</title>
        <meta name="description" content="Edited and modified by vaibhav And nagesh " />
        <link rel="icon" href="/insta.ico" />
      </Head>

      <div className="flex flex-col  ">
        <div className=""></div>



        <div className="md:border md:border-gray-200 mx-auto mt-8 md:w-[350px] w-full  h-[380px] bg-white">


          <div className="flex justify-center my-8">

            <img src="https://i.imgur.com/zqpwkLQ.png" />
          </div>



          <div className="flex flex-col">
            <input className="my-1 border mx-10 h-9 rounded border-gray-300"
              type="text"
              placeholder=' Phone number , Username, or email address' />



            <input className="my-1 border mx-10 h-9 rounded border-gray-300" type="password" placeholder='Password'/>
            <button className='border w-[270px] mx-auto h-8 rounded text-center text-white bg-blue-200 mt-2 font-bold'> Log In</button>
          </div>

          <div className="flex items-center justify-center my-5 space-x-4 ">
            <span className="first border-t w-28 h-0"></span>
            <div className="text-xs">OR</div>
            <span className="first border-t w-28 h-0"></span>

          </div>


          <div className="flex flex-col mt-6">
            <div className="item-1 mx-auto flex flex-row items-center justify-center space-x-2">
              <img className="h-4" src='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAOEAAADhCAMAAAAJbSJIAAAAclBMVEU7V53////x8/gxUZva4O6Ypck5VZw1U5tMaKjQ1udnfbTk6PJwg7S/x91AXKE1Upr3+PtEX6LHz+OvutajsNDU2uh5jLtUbapec6xccau2v9mCkr6qtdPi5vDz9frr7vVvgbSKmcJtgLSTocctTJiGl8L7pnmLAAAEuklEQVR4nO3da3OiMBSA4QCSAMpdCChKqfr//+KirrO70y1GaTg5mfPOtF86dXyGSwQCMudev9sECbOlXG52/W8Zu/u2Ugjot/WTccFl1/8Rhp+Cc+g39cONxo/wISxkapvvltcUd2EoU+j3oimvqa7C/tODfifa8up+FG6FlavoLS46h/XSXiBjou3Zzrq96N9xEbONVePgl9ILs3olHReiZPZ8VPt/tvsoiqIoiqIoiqIoiqKoH4gzzrkQ48/4e/zh965/seAE4ZXFkjyQbfOobaWUQZAnye3PVzRW6VWXtx/14HdxEVare1UYFkUc78qtfzoN+3qziRqcl625SNr61IUHN3O+K8uObn9YVWWLbiFyweR+W6y/x/1Tj+2aBE+TT1+ZN7ZGJhTJplwdlXnohFxE3Up98eETprn/qg+VkHtN7L7qwyTk5/3hdR8iIff8l1dQVMLrjIn3QiLkye5NIBIhz98G4hDyvHtvG8Qi5In/xiiBSMj5e8MEHqGIwhlABEKel+9vhBiE4zq6ngM0XyjaYhbQfCEbZuxHMQhFM3MRGi9kw0sH9PiEXM5dhMYLNzO3QuOFybvHTFiEvJnzeQ2DUNSzPs4gECblbKDZQh6sbBdGcwfDscOHwUIxvCBxD1VYxF8rG3OvPXGmfHamD3enzzbI8+Rr0IyJeFIpLr54kIlIU/G4yP1P0IyJeNA/142tfMkN3tYmSlul0XC1T4xeUBN5GxXg4cKQ+kbhoADMuhznGnrtvFUQVhFeIDvHCouwTNCuo6NQ4ei3v2C+ydxTOBNctaiFCgN+gXg/MwoVjix2Jn8oe5qCMCsR72cYVxAecT8LQUXoY94MVYSuj3lXqiZE/UgSEpLQ+FRGC9xC+5chCUmIIBKS0PhoPCQhgkhIQvMjoYPhPM3tZuRvSs8KwtN54hVuAZ9tTIKJ8udTvo7bfOoVri8CC/Si3p3oKdBxsqn/HzuWAegZVS9SQMyrzEFXU/3CbAt76WYBoQ8KXEDoDrD7Uv3CQ227EHqqhn5hIW0XxoHtayn0dBvtwqwD9S0gPPrA0xa1C/sB+Dq/duEBeqK+dmHY2C4sYI+dFhDGsMdOCwh30LNPdQuzDnpOmG6hCz4pTLdwXUOfbNQtXEW2C0PgYyf9wgL42Em/MIYeLHQLsx2wT7vwuIXeDHUL+wF6V6pbuN6AX13ULDw0ti/DCvrYSbswhL9lSK8wi+HvLk2bcCqF24DXU/8PfaLt1tTVPaEyU2FiPTTjpq//3UD/SG22ycQLQOOeRvNpSGh+JCSh8dE8bxIiiIQkND8SohfSeEhCBJGQhOZnvZBGCxIiiIQkND8SohfSeEhCBJGQhOZnvZBGCxIiiIQkND8SohfSeEhCBJGQhOZnvZBGCxIiiIQkND8SohfSeEhCBJGQhOZnvZBGCxIiiIQkNL8FhUDfL7CYMGES5PkLi42HXDKgB7kuJUwvbAfzEI2FhFwUzIV5ON9CQtG4zOlAFuJSy7B0mNODPBZsGaFX96PQCVsA4iJCL6qcq9ApGm/pFXWR0cKLQucudKp68a9O0i7kQtSV8xA6fdeKdFGjZiFPvabsnT/C0Rjv5ZLPz9IrTOSleHyj1C9Jyl5QpTlSAQAAAABJRU5ErkJggg==' />

              <span className='text-sm text-blue-900 font-semibold'>Log in with Faebook </span>
            </div>
            <div className="item-2"></div>
            <span className='text-xs mx-auto mt-5'>Forgotten Your Password? </span>

          </div>




        </div>





        <div className="md:border md:border-gray-200 mx-auto mt-3 w-[350px]  h-[65px] flex justify-center space-x-1 bg-white">
          <span className='text-sm  mt-5'>Dont have an Account? </span>
          <span className='text-sm  mt-5 font-bold text-blue-500'> Sign up </span>
        </div>





        <div className="flex justify-center my-5">Get the app.</div>




        <div className="flex flex-row justify-center space-x-2 ">

          <div className="flex justify-center items-center  bg-black rounded-md px-1">
            <div className="first mx-2">
              <img className='h-6' src='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAOEAAADhCAMAAAAJbSJIAAAAflBMVEUAAAD8/vz////z9fO2uLYICAj3+fdLS0vm6OZ4eXjw8vDr7eujpaMpKimfoJ9rbGuMjYyrravf4d+wsbBDQ0OKi4rP0c/Z29m7vLs6OjrBw8FPUE+UlZTT1dNzdHMbGxtXWFcWFxZjZGOAgYB1dnVHSEclJSUxMjEvMC8ZGRnBCm4CAAAHTklEQVR4nO2d63ayTAyFIbylFK0WULCeq7Xtd/83+IG2th6YQbIxweXzq6s/ZmU7wxwyScZxtPL1/PwsbUNzvC7HKRG50nY0xPAp9gt5rutJm9II09lOnXubCgcjfy/vJhVO/8q7PYWD1DvUd2sKJ3Ss77YUfvmn+lzXlzYLR++sQMqk7YIRnNOXK5xKGwbiIzwv0KUXadMwrM9MMd8KpU3D0CvT51JH2jYISalAlxJp4xD8KxfoUl/aOgBTg0CXvqTN4/NkFBi+SdvH5s0k0KWxtH18OmaFS2n7uCxKdjL7QSptIJvyhXCncChtIJeNWaBLr9IWcvEtAlu/oRnaunAubSGTgU1g65eKsU3hk7SFTF5tAgNpC7mMLArdibSFTKxdOJK2kIvhULjFa/2pwrYWrqUN5PJi2a+l0gayMXch+QNpA7nMLV24lDaQjflQcQv+p9jou2j7ZsaxbUnbP8s4TmRyIN6CQNOOjWJp4yAYBEbStmEov6e4kcu0Mjc33cIsuqVbchvaab+H+5uzCulWRmjBOYWULaXNAnKqkOiftFFQjhQSuT1pk8AcKCSKb2IXc8BeIeVkK2lzGqBL34RR9CBtTCP0vE44epkupe24c4fHwx+kbdkzefyB6ZDfTMcZ/WE0nm6EnW/v8/4sC/7YFGdpf14n2ufhfR5vGzrcEhSrStKXOnmsEm8n69gm8i49zg5T/1jdQZP++Pqu8EmSlZm0NWqWVI02WKwTv7Sl3xbD5L1RQUdMw3J5e5GdKho/E1tLvw3GV9M4DisZlWsMzDfyD1FwNgS6tMEgWVxB39Ct9qPvfveg/PQwyaq39PujNR60OE0vMyoX+a93JjxmMJpdKu+7vaBRjW+9GmblItOjhfJlVvHrO9tcgxFT60u+mkOrOuHw+5tcJWGntrxda15TMVNrhl27xbvbTY9X0HqNNRLJvzHHE1aVyW3ju6XsEy7wfQYyDgOl6DTaJerXR0HeB1SgJSBUAuydvy0UTQbCDVSdAvNeRA3UpU6BhUTMNlXhN/gDzRBr/0qvQMzlv+IeLACE4BgjYOQh4q4ZmXKBLnfFMCaYyUMZd6YxJpjJw4/qNyeYSUP0yBVoDzqXhAChmn3NAiGxqOYcQWEIkLRgiecVhRACDWF28kDCpS90jF4VTDy4ZoEbhEBTOK8wBIkzWkjLKAeUGaW3C1E5tIrPFJjUry9pGaWg8rxtOXRiEKoGmFaBsC7k3DI1CixiuiTkXB7IdrTAkugpBi5zSG0XogTayjpIgctb0LrcEyrz5FPpZ4j7CrX6Z2ATqda7GGDZGq0Xorh6Ekr9F7gUvg+tEw0soM1WfUQMlECt226Md2aL0tsKYCKm0tMvsCqttJQSgAqVdiGwIoFShcB02rtCGe4K7wrvCuW5K7wrvCuU567wrrAFCoFP6+hUePvnQ2SGjFaFOE+UVoU4T5RShUB/qVaFBCu7pPRiBlgm2vRKkSQ4hUp93kB/ot50Q1Qavtq7J9jDFw/8xPuGoP9AEpXeAQMfRdQaToMLN9EabYLrRKXRJgWgF2b19iEqWmGgNBjDxa36ipPWQGui3mQL1FHf8lSKKKCXAxUrBH2KeqeaHH8JUKi7VAQi+1DzVONCjlGK1/wCAkiU1mABsCpq9Ub9wJeo1pPxA/sgtVC8cdvBLmui9hS8h2JecoLy0kIFzPJCyivTbCGXVcnUk7a/CjRjpD1r9e0fQl6vfrZXKxS6nMd1W6Iwn3DqxjDoqshqgmo+5D1pjcK6aW0PYZsk1upEzd6aI2oGTG1apLCmo1jtLdsxtZ1TSpPYTqnv62/LXFPfNdWG7bdb7E7rCmzLvobjXWzFXMPpQmclbX0VeCF9bThD8eoqKXcNF3CjMtX7a6jDfJ5NfSfyfcPap1N+lUi1RbF2IO71dX+JiByFleYLYUwcmOJOpBDyhofi6RSVoaB2OiUP9VSpWoX1vIhnUBrbzjpUHKFznOKqmyn12ABrfzkqPTbIci45A4UKwa/PqyuHCe5CR10wH/tYeIqyqyi69NnoCqiKV8SP0Zw3aVV/IfwjnTmfejoRluN1hJpSdQRKLDlFTShYU+8BaxmnwLz1E1Ss+4AHAQ1oiKyFvT56HvlPsckxWrBxhSU2LTA/ZQgLxJW8LkU0F4Ni8JlJnUSk48KALyaxiRPFORZSPo1rCRTLVUB6D22IOPqvKVDkxI8sZ1aFl4tXfjpCucDiWvECG3NBXhaP5k875uM4Di4Ted0huuPNq2hhLiVIHk8SIybDtLpICYGO81HloJGLiCZlRVcWTrfaeKX3qyr7JbJ9jOSHXUsb/aBj00g+7O2Oi3k1ScwNjyqVB1gHJo2EeyKoDotuiXH54BtFlY+q65FXJpJSVNmd2mSnX1IxdV5aeuwlPf0ki3+wMvBArKK/o6xQN3uqU1ptuc6CX5XFX0GPlX6HZJ7uF/I47TNqc6yGabhrJ0jn1zgKVudjMYyiKBnwK4+8PW8B2OQ4/wO0jJg01bFlgwAAAABJRU5ErkJggg==' />
            </div>
            <div className="flex flex-col">
              <span className="text-white text-xs ">Download on the </span>
              <span className="text-white font-extrabold">App Store </span>
            </div>
          </div>


          <div className="flex justify-center items-center bg-black rounded-md px-1">
            <div className="first mx-2">
              <img className='h-6' src='data:image/webp;base64,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' />
            </div>
            <div className="flex flex-col">
              <span className="text-white text-xs ">GET IT ON </span>
              <span className="text-white font-extrabold">Google Play </span>
            </div>
          </div>
        </div>



        <div className="flex flex-wrap mt-14 mx-auto">
          <ul className='flex flex-wrap space-x-4 justify-center text-xs text-black space-y-2'>
            <li></li>
            <li> Meta </li>
            <li> About </li>
            <li> Blog </li>
            <li> Jobs </li>
            <li> Help </li>
            <li> API </li>
            <li> Privacy </li>
            <li> Terms </li>
            <li> top Accounts </li>
            <li> Hashtag </li>
            <li> Location </li>
            <li> Instagram lite </li>

          </ul>
        </div>

        <div className="flex flex-row justify-center text-xs mt-7 mb-14 space-x-4" >
          <span>English (UK)  &#709;</span>
          <span>&#169; 2022 Instagram from Meta</span>

        </div>




      </div>


    </div>
  )
}

export default Login;