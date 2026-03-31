import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useDropzone } from 'react-dropzone';
import { useTranslation } from 'react-i18next';
import { Trash, Upload } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { isPossiblePhoneNumber, isValidPhoneNumber, Value } from 'react-phone-number-input';
import { User } from '@/types/user.type';
import { useGetPreSignedUrlForUpload } from '@/lib/api/hooks/use-storage';
import { ImageCropper } from '../image-cropper/image-cropper';
import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui-kit/dialog';
import { Button } from '@/components/ui-kit/button';
import { Separator } from '@/components/ui-kit/separator';
import { Label } from '@/components/ui-kit/label';
import { Input } from '@/components/ui-kit/input';
import { Form, FormField, FormItem, FormControl, FormMessage } from '@/components/ui-kit/form';
import { UIPhoneInput } from '@/components/core';
import DummyProfile from '@/assets/images/dummy_profile.png';
import { useUpdateAccount } from '@/modules/profile/hooks/use-account';
import { ModuleName } from '@/constant/modules.constants';

/**
 * `EditProfile` component allows the user to edit their profile details, including their full name, email, phone number, and profile image.
 * It provides a form to upload a new profile image, edit personal information, and validates phone number input.
 * Once the form is successfully submitted, it triggers an update request to save the changes and navigate to the profile page.
 *
 * @component
 * @example
 * const userInfo = {
 *   fullName: 'John Doe',
 *   email: 'john.doe@example.com',
 *   phoneNumber: '+1234567890',
 *   profileImageUrl: 'http://example.com/profile.jpg',
 *   itemId: '12345'
 * };
 *
 * <EditProfile userInfo={userInfo} onClose={() => {}} />
 *
 * @param {Object} props - The component's props
 * @param {User} props.userInfo - The user information object containing current details to be edited
 * @param {Function} props.onClose - Callback function to close the dialog/modal
 *
 * @returns {React.Element} The rendered component
 */

type FormData = {
  itemId: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  profileImageUrl: File | string;
  profileImageId: string;
};

type EditProfileProps = {
  userInfo: User;
  onClose: () => void;
};

const projectKey = import.meta.env.VITE_X_BLOCKS_KEY || '';

export function EditProfile({ userInfo, onClose }: Readonly<EditProfileProps>) {
  const [previewImage, setPreviewImage] = useState<string>(DummyProfile);
  const [isFormChanged, setIsFormChanged] = useState(false);
  const [showCropper, setShowCropper] = useState(false);
  const [imageToCrop, setImageToCrop] = useState<string>('');
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  const { toast } = useToast();
  const { mutateAsync: getPreSignedUrlAsync } = useGetPreSignedUrlForUpload();

  const parseFullName = (fullName: string) => {
    const names = fullName.trim().split(' ');
    return {
      firstName: names[0] || '',
      lastName: names.slice(1).join(' ') || '',
    };
  };

  const { mutate: updateAccount, isPending } = useUpdateAccount({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['getAccount'] });
      queryClient.refetchQueries({ queryKey: ['getAccount'] });
      onClose();
      navigate('/profile');
    },
  });

  const form = useForm<FormData>({
    defaultValues: {
      itemId: '',
      fullName: '',
      email: '',
      phoneNumber: '',
      profileImageUrl: '',
    },
  });

  const { watch, setValue, handleSubmit, control } = form;
  const watchedValues = watch();

  useEffect(() => {
    if (userInfo) {
      setValue('fullName', `${userInfo.firstName ?? ''} ${userInfo.lastName ?? ''}`.trim());
      setValue('email', userInfo.email ?? '');
      setValue('phoneNumber', userInfo.phoneNumber ?? '');
      setValue('itemId', userInfo.itemId ?? '');
      setPreviewImage(userInfo.profileImageUrl || DummyProfile);
    }
  }, [userInfo, setValue]);

  useEffect(() => {
    const initialValues = {
      fullName: `${userInfo.firstName} ${userInfo.lastName}`,
      phoneNumber: userInfo.phoneNumber,
      profileImageUrl: userInfo.profileImageUrl || '',
    };

    setIsFormChanged(
      watchedValues.fullName !== initialValues.fullName ||
        watchedValues.phoneNumber !== initialValues.phoneNumber ||
        watchedValues.profileImageUrl !== initialValues.profileImageUrl
    );
  }, [watchedValues, userInfo]);

  const uploadFile = async (url: string, file: File) => {
    await fetch(url, {
      method: 'PUT',
      body: file,
      headers: {
        'Content-Type': file.type,
        'x-ms-blob-type': 'BlockBlob',
      },
    });
    return { uploadUrl: url.split('?')[0] };
  };

  const uploadProfileImage = async (file: File): Promise<string | null> => {
    try {
      setIsUploadingImage(true);

      const data = await getPreSignedUrlAsync({
        name: file.name,
        projectKey: projectKey,
        itemId: '',
        metaData: '',
        accessModifier: 'Public',
        configurationName: 'Default',
        parentDirectoryId: '',
        tags: '',
        moduleName: ModuleName.IAMConstruct,
      });

      if (!data.isSuccess || !data.uploadUrl) {
        toast({
          title: t('IMAGE_TOO_LARGE'),
          description: t('PLEASE_UPLOAD_IMAGE_SMALLER_SIZE'),
          variant: 'destructive',
        });
        return null;
      }

      const { uploadUrl } = await uploadFile(data.uploadUrl, file);
      return uploadUrl;
    } catch (error) {
      toast({
        title: t('UPLOAD_FAILED'),
        description: t('ERROR_OCCURRED_WHILE_UPLOADING_IMAGE'),
        variant: 'destructive',
      });
      return null;
    } finally {
      setIsUploadingImage(false);
    }
  };

  const onSubmit = async (data: FormData) => {
    const { firstName, lastName } = parseFullName(data.fullName);

    const profileImageUrl = typeof data.profileImageUrl === 'string' ? data.profileImageUrl : '';

    const payload = {
      itemId: data.itemId,
      firstName: firstName || '',
      lastName: lastName || '',
      email: data.email,
      phoneNumber: data.phoneNumber,
      profileImageUrl,
      memberships: userInfo.memberships || [],
    };

    updateAccount(payload);
  };

  const handleRemoveImage = () => {
    setValue('profileImageUrl', '');
    setPreviewImage(DummyProfile);
  };

  const onDrop = (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setImageToCrop(reader.result as string);
      setShowCropper(true);
    };
    reader.readAsDataURL(file);
  };

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': [],
      'image/png': [],
    },
    multiple: false,
  });

  return (
    <DialogContent className="rounded-md sm:max-w-[700px] overflow-y-auto max-h-screen">
      <DialogHeader>
        <DialogTitle>{t('EDIT_PROFILE_DETAILS')}</DialogTitle>
        <DialogDescription>{t('KEEP_DETAILS_ACCURATE_UP_TO_DATE')}</DialogDescription>
      </DialogHeader>
      <Form {...form}>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
          <div className="flex items-start sm:items-center">
            <img
              src={previewImage}
              alt="Profile"
              className="w-[90px] h-[90px] sm:w-[100px] sm:h-[100px] rounded-full object-cover border shadow-sm"
            />
            <div className="flex flex-col gap-2 ml-4 sm:ml-9">
              <h1 className="text-xl font-semibold">
                {userInfo.firstName} {userInfo.lastName}
              </h1>
              <p className="text-sm">{t('FILE_FORMAT_AND_SIZE')}</p>
              <div className="flex gap-2 sm:gap-4">
                <div {...getRootProps()} className="inline-block">
                  <Button size="sm" variant="outline" type="button">
                    <Upload className="w-4 h-4" />
                    <Label className="text-xs font-medium cursor-pointer">
                      {t('UPLOAD_IMAGE')}
                    </Label>
                    <input {...getInputProps()} className="hidden" />
                  </Button>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  type="button"
                  onClick={handleRemoveImage}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash className="w-4 h-4" />
                  {t('REMOVE')}
                </Button>
              </div>
            </div>
          </div>
          <Separator />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              control={control}
              name="fullName"
              rules={{ required: t('FULL_NAME_IS_REQUIRED') }}
              render={({ field }) => (
                <FormItem className="col-span-1 sm:col-span-2">
                  <Label>{t('FULL_NAME')}*</Label>
                  <FormControl>
                    <Input {...field} placeholder={t('ENTER_YOUR_FULL_NAME')} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <Label>{t('EMAIL')}</Label>
                  <FormControl>
                    <Input {...field} disabled />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="phoneNumber"
              rules={{
                validate: (value) => {
                  if (!value) return t('PHONE_NUMBER_IS_REQUIRED');
                  if (!isPossiblePhoneNumber(value)) return t('PHONE_NUMBER_LENGTH_INVALID');
                  if (!isValidPhoneNumber(value)) return t('INVALID_PHONE_NUMBER');
                  return true;
                },
              }}
              render={({ field }) => (
                <FormItem>
                  <Label>{t('MOBILE_NO')}</Label>
                  <FormControl>
                    <UIPhoneInput
                      {...field}
                      onChange={(value: Value) => setValue('phoneNumber', value ?? '')}
                      placeholder={t('ENTER_YOUR_MOBILE_NUMBER')}
                      defaultCountry="CH"
                      countryCallingCodeEditable={false}
                      international
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <DialogFooter className="mt-5 flex justify-end gap-2">
            <Button variant="outline" type="button" onClick={onClose}>
              {t('CANCEL')}
            </Button>
            <Button type="submit" loading={isPending} disabled={isPending || !isFormChanged}>
              {isPending ? t('SAVING') : t('SAVE')}
            </Button>
          </DialogFooter>
        </form>
      </Form>

      {showCropper && (
        <ImageCropper
          image={imageToCrop}
          onClose={() => setShowCropper(false)}
          isUploading={isUploadingImage}
          onCropComplete={async (croppedImage) => {
            try {
              const res = await fetch(croppedImage);
              const blob = await res.blob();

              if (blob.size > 2 * 1024 * 1024) {
                toast({
                  title: t('IMAGE_TOO_LARGE'),
                  description: t('CROPPED_IMAGE_TOO_LARGE'),
                  variant: 'destructive',
                });
                return;
              }

              const file = new File([blob], 'profile.jpg', { type: 'image/jpeg' });

              // Upload image immediately after cropping
              const uploadedUrl = await uploadProfileImage(file);

              if (uploadedUrl) {
                // Store the uploaded URL instead of the file
                setValue('profileImageUrl', uploadedUrl);
                setPreviewImage(croppedImage);
                setShowCropper(false);
              }
            } catch (error) {
              toast({
                title: t('UPLOAD_FAILED'),
                description: t('ERROR_OCCURRED_WHILE_UPLOADING_IMAGE'),
                variant: 'destructive',
              });
            }
          }}
          aspect={1}
        />
      )}
    </DialogContent>
  );
}
