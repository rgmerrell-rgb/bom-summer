import SignupForm from "./SignupForm";

export const metadata = {
  title: "Join Book of Mormon Summer",
};

export default function SignupPage() {
  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight" style={{ color: "#2C2416" }}>
          Join Book of Mormon Summer
        </h1>
        <p className="mt-2 text-sm" style={{ color: "#6A6050" }}>
          Set a reminder and start reading daily.
        </p>
      </div>

      <SignupForm />
    </div>
  );
}
