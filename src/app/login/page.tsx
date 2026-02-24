import { Container } from "@/components/Container";
import { SectionTitle } from "@/components/SectionTitle";
import { LoginForm } from "@/components/LoginForm";

export default function LoginPage() {
  return (
    <Container>
      <section className="py-12 sm:py-16">
        <SectionTitle
          title="Team Login"
          subtitle="Sign in with your Glittering Spa Sedifex account. Only users linked to this store can access SMS tools."
        />
        <LoginForm />
      </section>
    </Container>
  );
}
