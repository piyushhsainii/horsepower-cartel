import React, { FormEventHandler, useState } from "react";
import {
  PaymentElement,
  useStripe,
  useElements
} from "@stripe/react-stripe-js";
import { Layout } from "@stripe/stripe-js";
import axios from "axios";
import { url } from "@/lib/url";

export default function CheckoutForm({email,carid}:{email:string,carid:string}) {
  const stripe = useStripe();
  const elements = useElements();
  const [emailValue, setemail] = useState(email)
  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<Boolean>(false);


  const handleSubmit: FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsLoading(true);

    const result = await stripe.confirmPayment({
      elements,
      confirmParams: {
        payment_method:'card',
        payment_method_data: {
          billing_details: {
            email: email,
          },
        },
      },
      redirect: "if_required",
    });
    if (result?.paymentIntent?.status === "succeeded"){
      const { data } = await axios.post(`${url}/api/reserveCar`,{
        id:carid
      })
      data && data.success ?
      window.location.href = `/reserveCar/${carid}` : setMessage("Error occured while reserving your car")
    }
    // This point will only be reached if there is an immediate error when
    // confirming the payment. Otherwise, your customer will be redirected to
    // your `return_url`. For some payment methods like iDEAL, your customer will
    // be redirected to an intermediate site first to authorize the payment, then
    // redirected to the `return_url`.
    if (result?.error?.type === "card_error" || result?.error?.type === "validation_error") {
      setMessage(result.error.message as string);
    } else {
      setMessage("An unexpected error occurred.");
    }

    setIsLoading(false);
  };


  const paymentElementOptions = {
    layout: "tabs" as Layout ,
  };
  interface PaymentIntent {
    layout:string
  }
  return (
    <form id="payment-form" className="" onSubmit={handleSubmit}>
      <label>EMAIL</label>
      <input 
            type="email"
            required
            value={emailValue}
            onChange={(e)=>setemail(e.target.value)}
            placeholder={email}
            className="my-2 p-2 w-full border rounded bg-[#424353] text-slate-200"
          /> 
      <PaymentElement className=" text-white" id="payment-element" options={paymentElementOptions} />
      <button className="border-slate-700 border-opacity-35 border text-white bg-blue-400 p-2 rounded-md m-4 px-3" disabled={!!(isLoading || !stripe || !elements) } type="submit" id="submit">
        <span  id="button-text">
          {isLoading ? <div className="spinner" id="spinner"></div> : "Pay now"}
        </span>
      </button>
     { message && <div id="payment-message">{message}</div>}
      
    </form>
  );
}