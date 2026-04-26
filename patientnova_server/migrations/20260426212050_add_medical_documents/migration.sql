-- CreateTable
CREATE TABLE "medical_documents" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "sizeBytes" INTEGER NOT NULL,
    "data" TEXT NOT NULL,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "medicalRecordId" UUID NOT NULL,

    CONSTRAINT "medical_documents_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "medical_documents_medicalRecordId_idx" ON "medical_documents"("medicalRecordId");

-- AddForeignKey
ALTER TABLE "medical_documents" ADD CONSTRAINT "medical_documents_medicalRecordId_fkey" FOREIGN KEY ("medicalRecordId") REFERENCES "medical_records"("id") ON DELETE CASCADE ON UPDATE CASCADE;
