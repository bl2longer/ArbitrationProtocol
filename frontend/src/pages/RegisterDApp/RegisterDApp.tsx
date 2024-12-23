import { FC, useEffect, useMemo, useCallback } from 'react';
import { PageTitle } from '@/components/base/PageTitle';
import { useDappRegistryRegister } from '@/services/dapp-registry/hooks/contract/useDAppRegistryRegister';
import { isAddress } from 'viem';
import { EnsureWalletNetwork } from '@/components/base/EnsureWalletNetwork/EnsureWalletNetwork';
import { Button } from '@/components/ui/button';
import { useToasts } from '@/services/ui/hooks/useToasts';
import { Input } from '@/components/ui/input';
import { PageContainer } from '@/components/base/PageContainer';
import { PageTitleRow } from '@/components/base/PageTitleRow';
import { useDAppRegistryRegistrationFee } from '@/services/dapp-registry/hooks/contract/useDAppRegistryRegistrationFee';
import { useNavigate } from 'react-router-dom';
import { Form, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

const RegisterDApp: FC = () => {
  const navigate = useNavigate();
  const { errorToast, successToast } = useToasts();
  const { fetchRegistrationFee, registrationFee, isSuccess: registrationFeeKnown } = useDAppRegistryRegistrationFee();
  const { register, isPending } = useDappRegistryRegister();

  const formSchema = useMemo(() => z.object({
    dappAddress: z.string().refine(
      (value) => isAddress(value),
      "Not a valid dApp address"
    ),
  }), []);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      dappAddress: '0x',
    }
  });

  const handleRegisterDApp = useCallback(async (values: z.infer<typeof formSchema>) => {
    try {
      if (await register(values.dappAddress, registrationFee)) {
        successToast("dApp successfully registered!");

        // Back to dapps list.
        navigate("/dapps");
      }
    } catch (error) {
      errorToast(`Error registering dApp: ${error}`);
    }
  }, [errorToast, navigate, register, registrationFee, successToast]);

  useEffect(() => {
    void fetchRegistrationFee();
  }, [fetchRegistrationFee])

  return (
    <PageContainer>
      <PageTitleRow>
        <PageTitle className="flex flex-grow sm:flex-grow-0">Register dApp</PageTitle>
      </PageTitleRow>

      <div className="flex items-center justify-center">
        <div className="relative bg-white rounded-lg max-w-md w-full mx-4 p-6">
          <div className="mb-4">
            <p className="text-sm text-gray-500 mb-2">
              Registration Fee: {registrationFee !== undefined ? `${Number(registrationFee)} ELA` : `...`}
            </p>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleRegisterDApp)}>
                <FormField
                  control={form.control}
                  name="dappAddress"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>DApp Address (0x...)</FormLabel>
                      <Input type='text' {...field} />
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="mt-6 flex justify-end space-x-3">
                  <EnsureWalletNetwork continuesTo='Register'>
                    <Button
                      type="submit"
                      disabled={isPending && registrationFeeKnown}
                      className={!form.formState.isValid && "opacity-30"}>
                      {isPending ? 'Registering...' : 'Register dApp'}
                    </Button>
                  </EnsureWalletNetwork>
                </div>
              </form>
            </Form>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}

export default RegisterDApp;