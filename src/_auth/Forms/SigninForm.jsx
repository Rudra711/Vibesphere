import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, FormProvider } from "react-hook-form";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { SigninValidation } from "@/lib/validation";
import Loader from "@/components/shared/Loader";
import { Link, useNavigate } from "react-router-dom";
import { useSignInAccount } from "@/lib/react-query/queryAndMutations";
import { useUserContext } from "@/context/AuthContext";

function SigninForm() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { checkAuthUser, isLoading: isUserLoading } = useUserContext();

  // Define your form
  const methods = useForm({
    resolver: zodResolver(SigninValidation),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // Queries
  const { mutateAsync: signInAccount, isPending: isSigningInUser } = useSignInAccount();

  // Define a submit handler
  async function onSubmit(values) {
    try {
      // Check if there is an active session
      const isLoggedIn = await checkAuthUser();

      // If there is an active session, handle it
      if (isLoggedIn) {
        // Optionally, prompt the user to log out or handle it automatically
        // Example: logout functionality
        await account.deleteSession('current'); // Replace with appropriate method

        // Proceed with signing in
        const session = await signInAccount({
          email: values.email,
          password: values.password,
        });

        if (!session) {
          toast({ title: "Something went wrong. Please try again." });
          return;
        }

        // After successful sign-in, reset form and navigate
        methods.reset();
        navigate("/");
      } else {
        // No active session, proceed with signing in
        const session = await signInAccount({
          email: values.email,
          password: values.password,
        });

        if (!session) {
          toast({ title: "Something went wrong. Please try again." });
          return;
        }

        // After successful sign-in, reset form and navigate
        methods.reset();
        navigate("/");
      }
    } catch (error) {
      console.error("Sign in error:", error);
      toast({ title: "An unexpected error occurred. Please try again." });
    }
  }

  return (
    <FormProvider {...methods}>
      <div className="sm:w-420 flex-center flex-col">
        <img className="h-16" src="images/logoV.png" alt="logo" />
        <h2 className="h3-bold md:h2-bold pt-5 sm:pt-12">Log in to your account</h2>
        <p className="text-light-3 small-medium md:base-regular mt-2">
          Welcome back! Please enter your details.
        </p>
        <form onSubmit={methods.handleSubmit(onSubmit)} className="flex flex-col gap-5 w-full mt-4">
          <FormField
            control={methods.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input type="text" className="shad-input" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={methods.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input type="password" className="shad-input" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="shad-button_primary">
            {isSigningInUser || isUserLoading ? (
              <div className="flex-center gap-2">
                <Loader /> Loading...
              </div>
            ) : (
              "Sign in"
            )}
          </Button>

          <p className="text-small-regular text-light-2 text-center mt-2">
            Don't have an account?
            <Link to="/sign-up" className="text-primary-500 text-small-semibold ml-1">
              Sign up
            </Link>
          </p>
        </form>
      </div>
    </FormProvider>
  );
}

export default SigninForm;
