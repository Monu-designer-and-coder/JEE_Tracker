'use client';


import { Card, CardContent, CardHeader } from '@/components/ui/card';

export default function Tracker() {

   

	return <> 

        <section className="flex items-center justify-center gap-4 w-full h-full px-4">

        <Card className="w-1/3 mx-1">
             <CardHeader>
                <h2>Physics</h2>
             </CardHeader>
            <CardContent>

            </CardContent>
        </Card>
        <Card className="w-1/3 mx-1">
             <CardHeader>
                <h2>Chemistry</h2>
             </CardHeader>
            <CardContent>

            </CardContent>
        </Card>
        <Card className="w-1/3 mx-1">
             <CardHeader>
                <h2>Mathematics</h2>
             </CardHeader>
            <CardContent>

            </CardContent>
        </Card>
        </section>

    </>;
}
