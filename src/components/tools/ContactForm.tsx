import React from 'react'

const ContactForm = () => {
  return (
    <div className='w-full h-full flex justify-center lg:items-start items-center flex-col gap-3'>
      <h1 className='h-1/12 w-full lg:text-start text-center text-3xl text-white font-semibold nunito '>Contactanos</h1>
      <form
        id="miFormulario"
        className="sm:w-[400px] w-[300px] h-11/12 flex justify-center items-center flex-col gap-6 "
        action="https://formspree.io/"
        method="POST"
      >
        <input
          id="email"
          name="email"
          type="email"
          placeholder="Email"
          className="w-full h-[40px] p-2 bg-[#f3f3f3] focus:outline-none text-black font-normal rounded-md"
          autoComplete="off"
        />
        <input
          id="subject"
          name="subject"
          type="text"
          placeholder="Asunto"
          className="w-full h-[40px] p-2 bg-[#f3f3f3] focus:outline-none text-black font-normal rounded-md"
          autoComplete="off"
        />
        <textarea
          id="message"
          name="message"
          placeholder="Mensaje"
          className="w-full h-[155px] resize-none focus:outline-none px-3 py-2 bg-[#f3f3f3] font-normal text-black rounded-md"
          autoComplete="off"></textarea>
        <div className="w-full flex justify-center items-center flex-row">
          <button
            id="miBoton"
            type="submit"
            className="font-medium text-medium text-white w-[130px] h-[45px] rounded-md flex flex-row justify-center items-center gap-2 bg-[#F28C38]"
          >
            Enviar
            <img
              src="/icons/SendIcon.svg"
              alt="Enviar"
              className="w-[18px] h-[18px]"
            />
          </button>
        </div>
      </form>

    </div>
  )
}

export default ContactForm