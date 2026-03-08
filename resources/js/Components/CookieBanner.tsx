import { useEffect, useState } from 'react';
import { Button } from '@/Components/ui/button';

export default function CookieBanner() {
    const [show, setShow] = useState(false);

    useEffect(() => {
        const consent = localStorage.getItem('cookie_consent');
        if (!consent) {
            setShow(true);
        }
    }, []);

    const handleAccept = () => {
        localStorage.setItem('cookie_consent', 'true');
        setShow(false);
    };

    const handleDecline = () => {
        localStorage.setItem('cookie_consent', 'false');
        setShow(false);
    };

    if (!show) return null;

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 border-t border-primary/20 p-4 shadow-lg backdrop-blur-sm md:p-6">
            <div className="container mx-auto flex flex-col items-center justify-between gap-4 md:flex-row">
                <div className="flex-1 text-center md:text-left">
                    <h3 className="mb-2 text-lg font-bold text-foreground">
                        Nous respectons votre vie privée
                    </h3>
                    <p className="text-sm text-muted-foreground">
                        Nous utilisons des cookies pour améliorer votre expérience de navigation, diffuser des publicités ou des contenus personnalisés et analyser notre trafic. En cliquant sur « Tout accepter », vous consentez à notre utilisation des cookies.
                    </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                    <Button variant="outline" onClick={handleDecline} className="border-primary/20 hover:bg-primary/5">
                        Refuser
                    </Button>
                    <Button onClick={handleAccept} className="bg-primary text-primary-foreground hover:bg-primary/90">
                        Tout accepter
                    </Button>
                </div>
            </div>
        </div>
    );
}
