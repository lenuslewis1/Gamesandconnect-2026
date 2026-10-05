import Layout from '@/components/layout/Layout';
import SEOHead from '@/components/seo/SEOHead';
import { BreadcrumbSchema } from '@/components/seo/StructuredData';

const sections = [
    ['bookings', 'Bookings & event details'],
    ['payments', 'Payments & instalments'],
    ['refunds', 'Cancellations & refunds'],
    ['changes', 'Event changes & cancellations'],
    ['images', 'Photography, video & image use'],
    ['conduct', 'Participation & conduct'],
    ['content', 'Website content & personal information'],
    ['contact', 'Questions & complaints'],
];

export default function Terms() {
    return <Layout>
        <SEOHead title="Terms & Conditions — Bookings, Refunds & Image Use" description="Read Games and Connect terms for event bookings, payments, cancellation requests, refunds, photography and responsible participation." canonical="/terms-and-conditions" />
        <BreadcrumbSchema items={[{ name: 'Home', url: '/' }, { name: 'Terms & Conditions', url: '/terms-and-conditions' }]} />
        <header className="container max-w-4xl pt-16 pb-10 md:pt-24">
            <p className="text-sm uppercase tracking-widest text-muted-foreground mb-4">Games & Connect · Ghana</p>
            <h1 className="font-serif text-4xl md:text-6xl text-primary mb-6">Terms & Conditions</h1>
            <p className="text-lg text-muted-foreground">Clear information for booking, taking part and sharing memories.</p>
            <p className="text-sm text-muted-foreground mt-4">Last updated: 18 September 2026</p>
        </header>
        <div className="container max-w-4xl pb-20">
            <nav aria-label="Terms sections" className="rounded-2xl border border-border bg-muted/30 p-6 mb-10">
                <h2 className="font-semibold text-primary mb-3">On this page</h2>
                <ul className="grid sm:grid-cols-2 gap-3 text-sm">{sections.map(([id, title]) => <li key={id}><a className="underline underline-offset-4" href={`#${id}`}>{title}</a></li>)}</ul>
            </nav>
            <article className="prose prose-lg max-w-none prose-headings:font-serif prose-headings:text-primary prose-a:text-primary">
                <p>These terms explain how Games and Connect handles event and trip bookings, payments and event media. Read them alongside the details and any additional conditions provided for your chosen experience before you book. Nothing here removes rights or remedies you have under applicable law.</p>

                <section id="bookings" className="scroll-mt-28">
                    <h2>1. Bookings & event details</h2>
                    <p>Check the date, meeting point, itinerary, age requirements, inclusions, exclusions and total price before registering. Give accurate contact and attendee information so we can send booking updates. For group bookings, share the event instructions and relevant terms with every participant.</p>
                    <p>A submitted form or payment attempt is not itself proof of a completed payment. Keep your booking reference and payment receipt, and check the confirmation you receive. Contact us if the details are incorrect or a payment has been taken without a confirmation.</p>
                    <p>The customer cancellation policy in section 3 applies to bookings made under these terms. Any different event-specific condition must be clearly disclosed before payment and remains subject to applicable law.</p>
                </section>

                <section id="payments" className="scroll-mt-28">
                    <h2>2. Payments & instalments</h2>
                    <p>Prices are shown in Ghana cedis (GHS), unless explicitly stated otherwise. Use only the payment options shown in the booking process or confirmed through our official contact details. Check the recipient and amount before approving a payment.</p>
                    <p>Where part payment or pay-later options are offered, the remaining balance and agreed payment deadline still apply. Paying a deposit does not automatically make that deposit non-refundable. Any consequence of missing a payment deadline must follow the terms disclosed for that booking and applicable law.</p>
                    <p>If you suspect a duplicate, failed or incorrect charge, contact us with the booking reference, amount, payment date and transaction reference. Do not send your Mobile Money PIN, card security code, password or one-time verification code.</p>
                </section>

                <section id="refunds" className="scroll-mt-28">
                    <h2>3. Cancellations & refunds</h2>
                    <p>To cancel or request a refund, email <a href="mailto:gamesandconnectgh@gmail.com?subject=Cancellation%20or%20refund%20request">gamesandconnectgh@gmail.com</a> as soon as possible. Include the event name, booking reference, lead attendee name, payment reference and what you are requesting.</p>
                    <p>If we receive your cancellation at least 24 hours before the scheduled event start time, you are eligible for a refund of 50% of the amount you have paid for that booking. Cancellations received less than 24 hours before the scheduled start time are not refundable. The deadline is measured using the published event start time in Ghana time (GMT).</p>
                    <p>No refund is available for non-attendance, a missed departure or late arrival that prevents participation. Do not assume that a ticket can be transferred to another person; request confirmation first. These customer cancellation rules do not remove mandatory legal rights and do not govern an event cancelled by Games and Connect; see section 4.</p>
                    <p>For an approved refund, we will confirm the amount, payment method and expected processing time in writing. Refunds will normally be returned through the original payment method where supported, with any alternative agreed with the verified payer. These arrangements do not extend any deadline required by law. A credit or replacement booking is an alternative only if you agree to it.</p>
                </section>

                <section id="changes" className="scroll-mt-28">
                    <h2>4. Event changes & cancellations</h2>
                    <p>Weather, transport, venue availability or other circumstances may require changes. We will communicate material changes using the booking contact details and explain the available options.</p>
                    <p>If we cancel an event, or cannot provide a material part of what was booked, contact us about the refund or other remedy due under the booking terms and applicable law. A postponement does not automatically require you to accept a new date. We will explain the options before asking you to choose a replacement experience or credit.</p>
                    <p>Unforeseen circumstances do not automatically remove your refund rights. If you arrange separate accommodation or transport, check those suppliers' terms as well.</p>
                </section>

                <section id="images" className="scroll-mt-28">
                    <h2>5. Photography, video & image use</h2>
                    <p>Photography and filming take place at Games and Connect events. We give notice before booking and at the event. Our event-media policy is that, after receiving that notice, attendees agree to ordinary event photography and the uses described below unless they tell us otherwise. This opt-out approach does not replace express or written consent where the law requires it.</p>
                    <p>Event images may be used on the Games and Connect website, gallery, social channels, event recaps and general event promotions. For interviews, testimonials, direct marketing or other uses that require separate permission, we will request that permission first. We will also seek permission for a materially different use. We do not claim ownership of your identity or an unrestricted right to use your likeness.</p>
                    <p>If you do not want to be photographed, filmed or included in published event media, email us before the event or tell the organiser or photography team on arrival. You can also opt out during the event; declining image use does not prevent you from participating. You may decline a posed photograph or interview. For identifiable promotional images of children, permission must be obtained from a parent or guardian with authority to give it.</p>
                    <p>You can withdraw consent for future consent-based use or request review or removal by emailing <a href="mailto:gamesandconnectgh@gmail.com?subject=Image%20use%20or%20removal%20request">gamesandconnectgh@gmail.com</a>. Provide the event date and a link or screenshot identifying the image; avoid sending unnecessary identification documents.</p>
                    <p>We will review the request and remove, replace or restrict material on channels we control where appropriate, explaining any lawful reason it must be retained. We cannot guarantee removal of independent third-party reposts, cached copies or printed material already distributed, but this does not limit your rights concerning our own use.</p>
                    <p>If you submit a photo or video, you must have the rights and permissions needed to share it. Submission alone does not transfer copyright or grant unlimited advertising rights. Agree the intended use with us first. When posting your own event photos, respect other attendees' privacy and avoid sharing images they have asked you not to publish.</p>
                </section>

                <section id="conduct" className="scroll-mt-28">
                    <h2>6. Participation & conduct</h2>
                    <p>Follow reasonable host, venue and transport instructions. Treat attendees and staff respectfully. Harassment, violence, dangerous behaviour and damage to property may lead to removal from an activity. Any payment consequence remains subject to the booking terms and applicable law.</p>
                    <p>Read the activity description and ask about access or participation needs before booking. Tell the host if you need to stop an activity. Looking after your belongings and following instructions does not waive our responsibility for matters for which we are legally liable.</p>
                </section>

                <section id="content" className="scroll-mt-28">
                    <h2>7. Website content & personal information</h2>
                    <p>Our name, logo, written content and event media may be protected by intellectual property rights. Do not reuse them in advertising, imply our endorsement or sell copies without the relevant rights holder's permission. Linking to our public pages is welcome.</p>
                    <p>Booking and enquiry details are used to administer the requested service, communicate relevant updates and deal with payment or support requests. Promotional image permission is separate from information needed to manage a booking. Contact us to ask about your personal information or to raise a privacy concern.</p>
                    <p>These terms are subject to applicable Ghanaian law and any other mandatory protections that apply to your booking. Later changes to this page do not retrospectively remove rights attached to an existing booking.</p>
                </section>

                <section id="contact" className="scroll-mt-28">
                    <h2>8. Questions & complaints</h2>
                    <p>Email <a href="mailto:gamesandconnectgh@gmail.com">gamesandconnectgh@gmail.com</a> with your booking reference, the relevant event and a description of the issue. For image concerns, identify the particular post or photograph. We will review the concern and explain the next steps. You remain free to use any complaint or dispute route available under applicable law.</p>
                </section>
            </article>
        </div>
    </Layout>;
}
