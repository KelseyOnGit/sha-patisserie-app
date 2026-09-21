import {NextResponse} from 'next/server';

export async function POST(request: Request) {
    //1. Read the body sent by the client
    const data = await request.json();

    //2. just print the data to the console
    console.log("The client sent me: ", data);

    //3. Seend a sucess letter back
    return NextResponse.json({message: "Success"}); 
}