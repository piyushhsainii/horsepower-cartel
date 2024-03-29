"use client"
import NavMenu from '../../components/NavMenu'
import { Elements } from '@stripe/react-stripe-js';
import { StripeElementsOptions, loadStripe } from '@stripe/stripe-js';
import React, { useEffect, useState } from 'react'
import CheckoutForm from '../../components/CheckoutForm';
import Loading from '@/app/loading';
import { Armchair, Car, Fuel, Gauge, UserRound } from 'lucide-react';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { redirect } from 'next/navigation';
import { useSession } from 'next-auth/react';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY as string);

interface carData {
  id: String,
  carName: String,
  Img: String[],
  brand: String,
  price: Number,
  Fuel: String,
  Seat: String,
  Mileage: number,
  Availability: String,
  model: String,
  Plate: String,
  Year: String,
  type: String,
  Transmission: String,
  Color: String,
  ownerShip: String,
  KmsDone: String
}

const page = ({params}:any) => {

  const [clientSecret, setClientSecret] = useState(""); 
  const [Data, setData] = useState<carData | null>(null);
  const  { data } = useSession()

  useEffect(() => {
      // Create PaymentIntent as soon as the page loads
      fetch('/api/getCarInfo',{
        method:"POST",
        headers: { "Content-Type": "application/json" },
        body:JSON.stringify({id:params.id})
      }).then((res)=>res.json())
      .then((data)=>setData(data.car))

        
    }, []);

    useEffect(()=>{
      fetch("/api/payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // body: JSON.stringify({ items: [{ id: params.id}] , amount:200 } ),
        body: JSON.stringify({ items: [{ id: params.id }] ,amount:Data?.price, carid:params.id } ),
      }).then((res) => res.json())
      .then((data) => setClientSecret(data.clientSecret));
    },[Data])

    interface appearance {
      theme:'stripe' | "night" | "flat"
    }
    const appearance:appearance = {
      theme: 'night',
    };
    const options:StripeElementsOptions = {
      clientSecret,
      appearance,
    };
  if(Data?.Availability==='Reserved' ||  Data?.Availability === "Sold"){
    return redirect(`/car/${params.id}`)
  }
  return (
      Data === null ?
        <Loading/>
        :
    <div>
        <NavMenu />
        <div className='w-[80vw] m-auto   ' >
        <div className='flex justify-evenly p-4 gap-2 '>
          <div className=' w-[60%] m-auto pb-2 '>
          <Breadcrumb>
                 <BreadcrumbList>
                    <BreadcrumbItem>
                    <BreadcrumbLink href="/">Home</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                    <BreadcrumbLink href="/cars">Cars</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                    <BreadcrumbLink href={`/car/${params.id}`}>Car Info</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                      <BreadcrumbPage>Reservation</BreadcrumbPage>
                    </BreadcrumbItem>
                  </BreadcrumbList>
                </Breadcrumb>
            <div className='text-3xl font-semibold text-center my-3' >{Data?.carName}</div>
            <div className='text-xl font-semibold py-2 text-center'> { Data.price.toLocaleString('en-In', { style: 'currency', currency: 'INR' }) }  </div>
            <div className='w-[400px] m-auto'>
                <img src= { Data?.Img[0] as string }  className='w-[400px] h-[auto] max-h-[300px] rounded-md ' alt="" />
            </div>
          </div>

          <div className=' w-[40%] flex flex-wrap gap-2 justify-center' >
            <div className='w-[150px] p-2 h-[100px] flex flex-col justify-center items-center border border-slate-500 border-opacity-50 rounded-md font-semibold'>
              <div> <Car strokeWidth={1} /> </div>  <div className='text-muted-foreground'>Model </div> <div>{Data.model}</div>
            </div>
            <div className='w-[150px] p-2 h-[100px] flex flex-col justify-center items-center border border-slate-500 border-opacity-50 rounded-md font-semibold'>
              <div><UserRound strokeWidth={0.75} /></div> <div className='text-muted-foreground' > Ownership</div>  <div>{Data.ownerShip}</div>
            </div>
            <div className='w-[150px] p-2 h-[100px] flex flex-col justify-center items-center border border-slate-500 border-opacity-50 rounded-md font-semibold'>
            <div><Gauge strokeWidth={1} /></div> <div className='text-muted-foreground' >Kms Done</div>  <div> {Data.KmsDone}</div>              
            </div>
            <div className='w-[150px] p-2 h-[100px] flex flex-col justify-center items-center border border-slate-500 border-opacity-50 rounded-md font-semibold'>
            <div><Armchair strokeWidth={1} /></div> <div className='text-muted-foreground' >Seat Capacity</div>  <div> {Data.Seat}</div>   
            </div>
            <div className='w-[150px] p-2 h-[100px] flex flex-col justify-center items-center border border-slate-500 border-opacity-50 rounded-md font-semibold'>
             <div className='bg-white'><img width={28} src="/gear-shift.png" alt="" />  </div><div className='font-normal text-muted-foreground'>Transmission</div>  <div> {Data.Transmission}</div> 
            </div>
            <div className='w-[150px] p-2 h-[100px] flex flex-col justify-center items-center border border-slate-500 border-opacity-50 rounded-md font-semibold'>
             <div><Fuel strokeWidth={1} /></div>   <div className='text-muted-foreground' >Fuel Type</div>  <div> {Data.Fuel} </div> 
            </div>
        </div>
        </div>
        {/*  Payment  */}
    <div className='text-4xl font-semibold p-3 text-center'>
         Your dream car awaits. Reserve it today
    </div>
      <div className=" w-[50%] m-auto text-center ">
          {clientSecret && (
            <Elements options={options} stripe={stripePromise}>
              <CheckoutForm carid={params.id}  email={data?.user?.email!} />
            </Elements>
          )}
    </div>
    </div>
    </div>
  )
}

export default page



